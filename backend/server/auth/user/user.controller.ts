import * as bodyParser from 'body-parser';
import { Router as expressRouter } from 'express';
import * as passport from 'passport';
import { Strategy } from 'passport-local';
import { authorize } from '../../config';
import User from './user.model';
import Company from '../company/company.model';
import { Constants, User as UserS, Company as CompanyEntity } from 'fivebyone';

const { HTTP_OK, HTTP_BAD_REQUEST } = Constants;
passport.use(
  new Strategy(
    {
      usernameField: 'email',
    }, async(username, password, done) => {

      try {

        // Tries to find the user matching the given username
        const user = await User.findOne({
          email: username,
        });
        // Check if the password is valid
        if (user && user.isPasswordValid(password)) {

          return done(null, user);

        }
        // Throws an error if credentials are not valid
        throw new Error('Invalid credentials');

      } catch (error) {

        return done(error);

      }

    },
  ),
);

const isValidCompany = async(company: CompanyEntity): Promise<boolean> => {

  if (!company) {

    return false;

  }
  if (company && company._id) {

    const companyData: CompanyEntity = await Company.findById(company._id);

    if (companyData === null) {

      return false;

    }

  }
  return true;

};

const router = expressRouter();

const doLogin = (request: any, response: any) => {

  // Use passport to authenticate user login
  passport.authenticate('local', (error, user) => {

    if (!user) {

      return response.status(HTTP_BAD_REQUEST).json({
        error: error.message,
      });

    }
    // If login is valid generate a token and return it to the user
    const tokenSignature = user.generateJwt();
    return response.status(HTTP_OK).json(tokenSignature);

  })(request, response);

};

const getUser = async(request: any, response: any) => {

  try {

    const user = await User.findById(request.params.id).populate('company');
    if (!user) {

      return response.status(HTTP_BAD_REQUEST).send('No user with the specified id.');

    }
    return response.status(HTTP_OK).json(user);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const saveUser = async(request: any, response: any) => {

  try {

    const user = new User(request.body);
    try {

      user.setPassword(request.body.password);

    } catch (error) {
    }
    const isValid: boolean = await isValidCompany(user.company);

    if (!isValid) {

      return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

    }
    await user.save();
    return response.status(HTTP_OK).json(user);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const listAllUsers = async(request: any, response: any) => {

  const users = await User.find().populate('company');
  return response.status(HTTP_OK).json(users);

};

const updateUser = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const updateUserObject: UserS = request.body;
    delete updateUserObject.email;

    /*
     * Const isExists = await UserUtil.isEmailExists( updateUserObject.email);
     * if (isExists) {
     */

    //   Return response.status(HTTP_BAD_REQUEST).send('Cannot update user email');

    // }
    const isValid: boolean = await isValidCompany(updateUserObject.company);

    if (!isValid) {

      return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

    }
    await User.updateOne({ _id: id }, updateUserObject, { runValidators: true });
    return response.status(HTTP_OK).json(updateUserObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const deleteUser = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const resp = await User.deleteOne({ _id: id });
    if (resp.deletedCount === 0) {

      return response.status(HTTP_BAD_REQUEST).send('No user is deleted.');

    }

    return response.status(HTTP_OK).json('User deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/login').post(bodyParser.json(), doLogin);
router.route('/:id').get(authorize, getUser);
router.route('/').get(authorize, listAllUsers);
router.route('/:id').put(authorize, bodyParser.json(), updateUser);
router.route('/').post(authorize, bodyParser.json(), saveUser);
router.route('/:id')['delete'](authorize, bodyParser.json(), deleteUser);

export default router;
