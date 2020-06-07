import { Request, Response, Router as expressRouter } from 'express';
import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { UserModel } from './user.model';
import Company from '../company/company.model';
import { Constants, User as UserS, Company as CompanyEntity } from 'fivebyone';
import { AuthUtil } from '../../util/auth.util';

const { HTTP_OK, HTTP_BAD_REQUEST } = Constants;

const validateRequestedUser = async(request: any, email: string, password: string, done: any) => {

  // Get the company name from URL.
  const companyName = request.get('COMPANY');
  if (!companyName) {

    return done('Login failed.', null);

  }
  const User = UserModel.createModel(companyName);
  try {

    const user = await User.findOne({ email });
    if (user && user.isPasswordValid(password)) {

      return done(null, user);

    }

  } catch (error) {
  }
  return done('Login failed.', null);

};

passport.use('user-login', new LocalStrategy({
  usernameField: 'email',
  passReqToCallback: true,
}, validateRequestedUser));

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

  if (!request.user) {

    return response.status(HTTP_BAD_REQUEST).json({'user': 'login failed.'});

  }
  const jwtToken = request.user.generateJwt();
  response.cookie('jwt', jwtToken.token, {
    httpOnly: true,
    sameSite: true,
    signed: true,
    secure: true
  });
  return response.status(HTTP_OK).json(jwtToken);

};

const getUser = async(request: any, response: any) => {

  try {

    const User = UserModel.createModel(process.env.COMMON_DB);
    const user = await User.findById(request.params.id).populate('company')
      .populate('companyBranch');
    if (!user) {

      return response.status(HTTP_BAD_REQUEST).send('No user with the specified id.');

    }
    return response.status(HTTP_OK).json(user);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const saveUser = async(request: Request, response: Response) => {

  try {

    const User = UserModel.createModel(process.env.COMMON_DB);
    const user = new User(request.body);
    user.setPassword(request.body.password);
    const isValidCom: boolean = await isValidCompany(user.company);

    if (!isValidCom) {

      return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

    }
    await user.save();
    return response.status(HTTP_OK).json(user);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const listAllUsers = async(request: any, response: any) => {

  const User = UserModel.createModel(process.env.COMMON_DB);
  const users = await User.find().populate('company');
  return response.status(HTTP_OK).json(users);

};

const updateUser = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const updateUserObject: UserS = request.body;
    delete updateUserObject.email;
    const isValidCom: boolean = await isValidCompany(updateUserObject.company);

    if (!isValidCom) {

      return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

    }
    const User = UserModel.createModel(process.env.COMMON_DB);
    await User
      .updateOne({ _id: id }, updateUserObject, { runValidators: true })
      .populate('company')
      .populate('companyBranch');
    return response.status(HTTP_OK).json(updateUserObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const deleteUser = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const User = UserModel.createModel(process.env.COMMON_DB);
    const resp = await User.deleteOne({ _id: id });
    if (resp.deletedCount === 0) {

      return response.status(HTTP_BAD_REQUEST).send('No user is deleted.');

    }

    return response.status(HTTP_OK).json('User deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/login').post(passport.authenticate('user-login', {session: false}), doLogin);
router.route('/:id').get(AuthUtil.authorize, getUser);
router.route('/').get(AuthUtil.authorize, listAllUsers);
router.route('/:id').put(AuthUtil.authorize, updateUser);
router.route('/').post(AuthUtil.authorize, saveUser);
router.route('/:id')['delete'](AuthUtil.authorize, deleteUser);

export default router;
