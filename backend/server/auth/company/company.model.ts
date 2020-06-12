import { Document, Schema, Model, connection } from 'mongoose';
import { CompanyS } from 'fivebyone';
import { CommonUtil } from '../../util/common.util';
import { CompanyImpl } from './CompanyImpl';

export interface CompanyDoc extends CompanyS, Document {
  code: string;
  setCode(): void;
}

export class CompanyModel {

  private static companySchema = new Schema<CompanyDoc>({
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    addressLine1: {
      type: String,
      trim: true,
      index: true
    },
    addressLine2: {
      type: String,
      trim: true,
      index: true,
    },
    addressLine3: {
      type: String,
      trim: true,
      index: true,
    },
    addressLine4: {
      type: String,
      trim: true,
      index: true,
    },
    contact: {
      type: String,
      trim: true,
      index: true,
      validate: {
        validator: CommonUtil.validateMobile,
        message: (props: any) => {

          return `${props.value} is not a valid 'Contact Number'.`;

        }
      }
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      index: true,
      validate: {
        validator: CommonUtil.validateEmail,
        message: (props: any) => {

          return `${props.value} is not a valid 'Email Id'.`;

        }
      }
    },
    phone: {
      type: String,
      trim: true,
      index: true,
      validate: {
        validator: CommonUtil.validateMobile,
        message: (props: any) => {

          return `${props.value} is not a valid Phone number`;

        }
      }
    },
    pincode: {
      type: String,
      trim: true,
      index: true,
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
    }

  });


  public static createModel = (): Model<CompanyDoc, {}> => {

    CompanyModel.companySchema.loadClass(CompanyImpl);
    const mongoConnection = connection.useDb(process.env.COMMON_DB);
    return mongoConnection.model('Company', CompanyModel.companySchema);

  }

}
