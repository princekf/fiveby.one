import { Request, Response, Router as expressRouter } from 'express';
import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {AdminUserModel} from './admin.model';
import { Constants } from 'fivebyone';
// Import { AuthUtil } from '../../util/auth.util';

const { HTTP_OK, HTTP_BAD_REQUEST } = Constants;

const router = expressRouter();


const validateRequestedUser = async(email: string, password: string, done: any) => {

  const User = AdminUserModel.createModel();
  try {

    const user = await User.findOne({ email});

    if (user && user.isPasswordValid(password)) {

      return done(null, user);

    }

  } catch (error) {

  }
  return done('Login failed.', null);

};

passport.use('admin-login', new LocalStrategy({
  usernameField: 'email',
}, validateRequestedUser));

const installAdminUser = async(request: Request, response: Response) => {

  try {

    const User = AdminUserModel.createModel();
    const adminCount = await User.count({});
    if (adminCount > 0) {

      return response.status(HTTP_BAD_REQUEST).send('Already installed.');

    }
    const user = new User(request.body);
    user.setPassword(request.body.password);
    await user.save();
    return response.status(HTTP_OK).json(user);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const loginAdmin = (request: any, response: any) => {

  if (!request.user) {

    return response.status(HTTP_BAD_REQUEST).json({'user': 'login failed.'});

  }
  const token = request.user.generateJwt();

  return response.status(HTTP_OK).json(token);

};

const listAllAdmin = async(request: any, response: any) => {

  const User = AdminUserModel.createModel();
  const userShowRooms = await User.find();
  return response.status(HTTP_OK).json(userShowRooms);

};

const getAdmin = async(request: any, response: any) => {

  try {

    const User = AdminUserModel.createModel();
    const user = await User.findById(request.params.id);
    if (!user) {

      return response.status(HTTP_BAD_REQUEST).send('No user with the specified id.');

    }
    return response.status(HTTP_OK).json(user);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const updateAdmin = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const adminObj: AdminUserModel = request.body;

    const User = AdminUserModel.createModel();
    const updatedDetails = await User.updateOne({ _id: id }, adminObj, { runValidators: true });
    if (updatedDetails.nModified === 0) {

      return response.status(HTTP_BAD_REQUEST).send('Update failed');

    }
    return response.status(HTTP_OK).json(adminObj);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const deleteAdmin = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const User = AdminUserModel.createModel();
    const resp = await User.deleteOne({ _id: id });
    if (resp.deletedCount === 0) {

      return response.status(HTTP_BAD_REQUEST).send('No user is deleted.');

    }

    return response.status(HTTP_OK).json('User deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/').post(installAdminUser);
router.route('/').get(passport.authenticate('admin-jwt', { session: false}), listAllAdmin);
router.route('/:id').get(passport.authenticate('admin-jwt', { session: false}), getAdmin);
router.route('/:id').put(passport.authenticate('admin-jwt', { session: false}), updateAdmin);
router.route('/:id')['delete'](passport.authenticate('admin-jwt', { session: false}), deleteAdmin);
router.route('/login').post(passport.authenticate('admin-login', {session: false}), loginAdmin);

export default router;
