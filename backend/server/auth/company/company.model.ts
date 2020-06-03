import { Document, Schema, model } from 'mongoose';
import { SchemaDef } from '../../../types';
import { CompanyS } from 'fivebyone';

interface CompanyDoc extends CompanyS, Document {
}
const validateEmail = (email: string): boolean => {

  const emailRegEx = /^(?<name>[a-zA-Z0-9_\-\.]+)@(?<domain>[a-zA-Z0-9_\-\.]+)\.(?<extn>[a-zA-Z]{2,5})$/ugm;
  return emailRegEx.test(email);

};
const validateMobile = (mobile: string): boolean => {

  const mobileRegEx = /^(?<mobileNum>\+\d{1,3}[- ]?)?\d{10}$/ugm;
  return mobileRegEx.test(mobile);

};
const companySchemaDef: SchemaDef<CompanyS> = {
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
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
      validator: validateMobile,
      message: (props) => {

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
      validator: validateEmail,
      message: (props) => {

        return `${props.value} is not a valid 'Email Id'.`;

      }
    }
  },
  phone: {
    type: String,
    trim: true,
    index: true,
    validate: {
      validator: validateMobile,
      message: (props) => {

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

};

// Declare the model schema
const permissionSchema = new Schema(companySchemaDef);

export default model<CompanyDoc>('Company', permissionSchema);
