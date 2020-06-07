import { pbkdf2Sync, randomBytes } from 'crypto';
import { sign } from 'jsonwebtoken';
import { CommonUtil } from '../../util/common.util';
const ITERATIONS = 100000;
const KEY_LENGTH = 512;
const EXPIRY_IN_MINUTES = 30;
const BYTE_SIZE = 16;
const SECOND_IN_MILLIE = 1000;

export class UserImpl {

  private id: string;

  private email: string;

  private salt: string;

  private hash: string;

  // Create a salt and hash from the password
  public setPassword(password: string) {

    if (!CommonUtil.validatePassword(password)) {

      throw new Error('Password should have mininum 6 character, one upper case, one lower case, one digit, and one special character');

    }
    this.salt = randomBytes(BYTE_SIZE).toString('hex');
    this.hash = pbkdf2Sync(password, this.salt, ITERATIONS, KEY_LENGTH, 'sha512').toString('hex');

  }

  // Check if hashes match
  public isPasswordValid(password: string): boolean {

    const hash = pbkdf2Sync(password, this.salt, ITERATIONS, KEY_LENGTH, 'sha512').toString('hex');
    return this.hash === hash;

  }

  // Generate access token for 30 minutes
  public generateJwt(): { token: string; expiry: Date } {

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + EXPIRY_IN_MINUTES);

    const token = sign(
      {
        _id: this.id,
        email: this.email,
        exp: Math.round(expiry.getTime() / SECOND_IN_MILLIE),
      }, process.env.AUTH_SHARED_SECRET,
    );

    return {
      token,
      expiry,
    };

  }

}
