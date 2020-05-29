import { pbkdf2Sync, randomBytes } from 'crypto';
import { sign } from 'jsonwebtoken';
import { Document, Schema, model } from 'mongoose';
import { SchemaDef } from '../../../types';
import {Constants, UserS} from 'fivebyone';
import { UserUtil } from './UserUtil';

const {SECOND_IN_MILLIE} = Constants;

const ITERATIONS = 100000;
const KEY_LENGTH = 512;
const EXPIRY_IN_MINUTES = 30;
const BYTE_SIZE = 16;
interface UserM extends UserS{
  hash: string;
  salt: string;
}
// Declare the model interface
interface UserDoc extends UserM, Document {
  setPassword(password: string): void;
  isPasswordValid(password: string): boolean;
  generateJwt(): { token: string; expiry: Date };
}

const validateEmail = (email: string): boolean => {

  const emailRegEx = /^(?<name>[a-zA-Z0-9_\-\.]+)@(?<domain>[a-zA-Z0-9_\-\.]+)\.(?<extn>[a-zA-Z]{2,5})$/ugm;
  return emailRegEx.test(email);

};

const validateMobile = (mobile: string): boolean => {

  const mobileRegEx = /^(?<mobileNum>\+\d{1,3}[- ]?)?\d{10}$/ugm;
  return mobileRegEx.test(mobile);

};

const userSchemaDef: SchemaDef<UserM> = {

  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    index: true,
    validate: {
      validator: validateEmail,
      message: (props) => {

        return `${props.value} is not a valid email.`;

      }
    }
  },
  hash: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  mobile: {
    type: String,
    trim: true,
    index: true,
    validate: {
      validator: validateMobile,
      message: (props) => {

        return `${props.value} is not a valid mobile number.`;

      }
    }

  },
  addressLine1: {
    type: String,
    trim: true,
    index: true,
  },
  addressLine2: {
    type: String,
    trim: true,
  },
  addressLine3: {
    type: String,
    trim: true,
  },
  addressLine4: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
    index: true,
  },
  country: {
    type: String,
    trim: true,
    index: true,
  },
  pinCode: {
    type: String,
    trim: true,
    index: true,
  },
};

// Declare the model schema
const userSchema = new Schema(userSchemaDef);

// Define some public methods for our model
class UserClass {

  private id: string;

  private email: string;

  private salt: string;

  private hash: string;

  // Create a salt and hash from the password
  public setPassword(password: string) {

    if (!UserUtil.validatePassword(password)) {

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

// Important! Don't forget to use loadClass so your new methods will be included in the model
userSchema.loadClass(UserClass);

export default model<UserDoc>('User', userSchema);
