
import * as passport from 'passport';
import {Strategy as JWTStrategy, ExtractJwt} from 'passport-jwt';
import {UserSession} from '../auth/user/UserImpl';

export class AuthUtil {

  public static initPassports = () => {

    const jwtOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.AUTH_SHARED_SECRET,
      passReqToCallback: false,
    };

    passport.use('user-jwt', new JWTStrategy(jwtOptions, (jwtPayload, done) => {

      return done(null, jwtPayload);

    }));

    const jwtOptionsAdmin = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.AUTH_SHARED_SECRET,
      passReqToCallback: false,
    };

    passport.use('admin-jwt', new JWTStrategy(jwtOptionsAdmin, (jwtPayload: any, done: any) => {

      if (jwtPayload.isAdmin) {

        return done(null, jwtPayload);

      }
      return done('Permission denied.', false);

    }));

  };

  public static findSessionDetails = (request: any): UserSession => {

    if (!request.user) {

      throw new Error('Permission denied.');

    }
    const sessionDetails: UserSession = {
      companyCode: request.user.companyCode,
      _id: request.user.id,
      email: request.user.email,
      exp: request.user.exp
    };
    return sessionDetails;

  };

}
