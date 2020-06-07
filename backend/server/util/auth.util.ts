
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

}
