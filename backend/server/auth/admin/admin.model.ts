import {Schema, Document, Model, connection} from 'mongoose';
import { CommonUtil } from '../../util/common.util';
import { AdminUserImpl } from './AdminUserImpl';

interface UserM {
  email: string;
  name: string;
  mobile: string;
  hash: string;
  salt: string;
  setPassword(password: string): void;
  isPasswordValid(password: string): boolean;
  generateJwt(): { token: string; expiry: Date };
}
// Declare the model interface
interface AdminUserDoc extends UserM, Document {
}

export class AdminUserModel {

  private static userSchema = new Schema<AdminUserDoc>({
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

    }
  });

  public static createModel = (): Model<AdminUserDoc, {}> => {

    AdminUserModel.userSchema.loadClass(AdminUserImpl);
    const mongoConnection = connection.useDb(process.env.COMMON_DB);
    return mongoConnection.model('AdminUser', AdminUserModel.userSchema);

  }

}
