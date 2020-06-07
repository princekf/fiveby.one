import * as mongoose from 'mongoose';
import { UserS } from 'fivebyone';
import { CommonUtil } from '../../util/common.util';
import { UserImpl } from './UserImpl';

const {Schema} = mongoose;

interface UserM extends UserS {
  hash: string;
  salt: string;
  setPassword(password: string): void;
  isPasswordValid(password: string): boolean;
  generateJwt(): { token: string; expiry: Date };
}
// Declare the model interface
interface UserDoc extends UserM, mongoose.Document {
}

export class UserModel {

  private static userSchema = new Schema<UserDoc>({
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      index: true,
      validate: {
        validator: CommonUtil.validateEmail,
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
        validator: CommonUtil.validateMobile,
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
    }
  });

  public static createModel = (dbName: string): mongoose.Model<UserDoc, {}> => {

    UserModel.userSchema.loadClass(UserImpl);
    const mongoConnection = mongoose.connection.useDb(dbName);
    return mongoConnection.model('User', UserModel.userSchema);

  }

}
