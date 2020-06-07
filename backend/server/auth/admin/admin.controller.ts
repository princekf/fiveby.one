import { Request, Response, Router as expressRouter } from 'express';
import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {Strategy as JWTStrategy, ExtractJwt} from 'passport-jwt';
import {AdminUserModel} from './admin.model';
import { Constants } from 'fivebyone';

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

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.AUTH_SHARED_SECRET,
  passReqToCallback: false,
};

passport.use('admin-jwt', new JWTStrategy(jwtOptions, (jwtPayload: any, done: any) => {

  if (jwtPayload.isAdmin) {

    return done(null, jwtPayload);

  }
  return done('Permission denied.', false);

}));

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
  const jwtToken = request.user.generateJwt();
  response.cookie('jwt', jwtToken.token, {
    httpOnly: true,
    sameSite: true,
    signed: true,
    secure: true
  });
  return response.status(HTTP_OK).json(jwtToken);

};

router.route('/login').post(passport.authenticate('admin-login', {session: false}), loginAdmin);
router.route('/').post(installAdminUser);

export default router;
