import { Request, Response, Router as expressRouter } from 'express';
import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { UserModel } from './user.model';
import { CompanyModel } from '../company/company.model';
import { Constants, User as UserS, Company as CompanyEntity } from 'fivebyone';
import { AuthUtil } from '../../util/auth.util';

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;

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

const getCompany = async(companyId: string): Promise<CompanyEntity> => {

  if (!companyId) {

    return null;

  }
  const Company = CompanyModel.createModel();
  const companyData: CompanyEntity = await Company.findById(companyId);

  if (companyData === null) {

    return null;

  }

  return companyData;

};

const router = expressRouter();

const doLogin = (request: any, response: any) => {

  if (!request.user) {

    return response.status(HTTP_BAD_REQUEST).json({ 'user': 'login failed.' });

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

const getUser = async(request: Request, response: Response) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).send('Permission denied');

    }
    const company: CompanyEntity = await getCompany(sessionDetails.company);

    if (!company) {

      return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

    }
    const User = UserModel.createModel(company.code);
    const user = await User.findById(request.params.id)
      .populate('companyBranch');
    if (!user) {

      return response.status(HTTP_BAD_REQUEST).send('No user with the specified id.');

    }
    return response.status(HTTP_OK).json(user);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const getUserForAdmin = async(request: Request, response: Response) => {

  try {

    const company: CompanyEntity = await getCompany(request.params.cId);

    if (!company) {

      return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

    }
    const User = UserModel.createModel(company.code);
    const user = await User.findById(request.params.id)
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

    // Fetch company name by company id
    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).send('Permission denied');

    }

    const company: CompanyEntity = await getCompany(sessionDetails.company);

    if (!company) {

      return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

    }
    const User = UserModel.createModel(company.code);
    const user = new User(request.body);
    user.setPassword(request.body.password);
    await user.save();
    return response.status(HTTP_OK).json(user);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const saveUserForAdmin = async(request: Request, response: Response) => {

  try {

    const { cId } = request.params;
    const company: CompanyEntity = await getCompany(cId);

    if (!company) {

      return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

    }
    const User = UserModel.createModel(company.code);
    const user = new User(request.body);
    user.setPassword(request.body.password);
    await user.save();
    return response.status(HTTP_OK).json(user);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const listAllUsers = async(request: Request, response: Response) => {

  const sessionDetails = AuthUtil.findSessionDetails(request);
  if (!sessionDetails.company) {

    return response.status(HTTP_UNAUTHORIZED).send('Permission denied');

  }
  const company: CompanyEntity = await getCompany(sessionDetails.company);

  if (!company) {

    return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

  }
  const User = UserModel.createModel(company.code);
  const users = await User.find().populate('company');
  return response.status(HTTP_OK).json(users);

};

const listUsersForAdmin = async(request: Request, response: Response) => {

  const { cId } = request.params;
  const company: CompanyEntity = await getCompany(cId);

  if (!company) {

    return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

  }
  const User = UserModel.createModel(company.code);
  const users = await User.find().populate('company');
  return response.status(HTTP_OK).json(users);

};

const updateUserForAdmin = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const { cId } = request.params;
    const updateUserObject: UserS = request.body;
    delete updateUserObject.email;
    const company: CompanyEntity = await getCompany(cId);

    if (!company) {

      return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

    }
    const User = UserModel.createModel(company.code);
    await User
      .updateOne({ _id: id }, updateUserObject, { runValidators: true })
      .populate('companyBranch');
    return response.status(HTTP_OK).json(updateUserObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const updateUser = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).send('Permission denied');

    }
    const updateUserObject: UserS = request.body;
    delete updateUserObject.email;
    const company: CompanyEntity = await getCompany(sessionDetails.company);

    if (!company) {

      return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

    }
    const User = UserModel.createModel(company.code);
    await User
      .updateOne({ _id: id }, updateUserObject, { runValidators: true })
      .populate('companyBranch');
    return response.status(HTTP_OK).json(updateUserObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const deleteUser = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).send('Permission denied');

    }
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

const deleteUserForAdmin = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const { cId } = request.params;
    const company: CompanyEntity = await getCompany(cId);

    if (!company) {

      return response.status(HTTP_BAD_REQUEST).send('Company should be valid.');

    }
    const User = UserModel.createModel(company.code);
    const resp = await User.deleteOne({ _id: id });
    if (resp.deletedCount === 0) {

      return response.status(HTTP_BAD_REQUEST).send('No user is deleted.');

    }

    return response.status(HTTP_OK).json('User deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/login').post(passport.authenticate('user-login', { session: false }), doLogin);

router.route('/:id').get(passport.authenticate('user-jwt', { session: false }), getUser);

router.route('/user/admin/:cId/:id').get(passport.authenticate('admin-jwt', { session: false }), getUserForAdmin);

router.route('/').get(passport.authenticate('user-jwt', { session: false }), listAllUsers);

router.route('/user/admin/:cId').get(passport.authenticate('admin-jwt', { session: false }), listUsersForAdmin);

router.route('/:id').put(passport.authenticate('user-jwt', { session: false }), updateUser);

router.route('/user/admin/:cId/:id').put(passport.authenticate('admin-jwt', { session: false }), updateUserForAdmin);

router.route('/').post(passport.authenticate('user-jwt', { session: false }), saveUser);

router.route('/user/admin/:cId').post(passport.authenticate('admin-jwt', { session: false }), saveUserForAdmin);

router.route('/:id')['delete'](passport.authenticate('user-jwt', { session: false }), deleteUser);

router.route('/user/admin/:cId/:id')['delete'](passport.authenticate('admin-jwt', { session: false }), deleteUserForAdmin);

export default router;
