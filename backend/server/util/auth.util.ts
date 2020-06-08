
import * as passport from 'passport';
import {Strategy as JWTStrategy, ExtractJwt} from 'passport-jwt';

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

  public static findSessionDetails = (request: any) => {

    if (!request.user) {

      throw new Error('Permission denied.');

    }
    return {
      company: process.env.COMMON_DB,
      branch: 'branch2',
      finYear: 'fin2'
    };

  };

  public static authorize = (_request: any, _response: any, next: any) => {

    passport.authenticate('user-jwt', { session: false});
    next();

  };


  public static authorizeAdmin = (_request: any, _response: any, next: any) => {

    passport.authenticate('admin-jwt', { session: false});
    next();

  };

}
