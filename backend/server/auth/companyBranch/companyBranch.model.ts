import { Document, Schema, model } from 'mongoose';
import { SchemaDef } from '../../../types';
import { CompanyBranchS, Constants } from 'fivebyone';
const { DATE_FORMAT } = Constants;
import * as moment from 'moment';

interface CompanyBranchDoc extends CompanyBranchS, Document { }

const validateEmail = (email: string): boolean => {

  const emailRegEx = /^(?<name>[a-zA-Z0-9_\-\.]+)@(?<domain>[a-zA-Z0-9_\-\.]+)\.(?<extn>[a-zA-Z]{2,5})$/ugm;
  return emailRegEx.test(email);

};
const validateMobile = (mobile: string): boolean => {

  const mobileRegEx = /^(?<mobileNum>\+\d{1,3}[- ]?)?\d{10}$/ugm;
  return mobileRegEx.test(mobile);

};

const validateFinancialYear = (finYears: []): boolean => {

  if (!finYears || finYears.length === 0) {

    return false;

  }
  const isValid = finYears.reduce((_result: boolean, item: any): boolean => {

    const startMom = moment(item.startDate, DATE_FORMAT, true);
    const endMom = moment(item.endDate, DATE_FORMAT, true);
    if (!startMom.isValid() || !endMom.isValid()) {

      return false;

    }
    if (startMom.isAfter(endMom)) {

      return false;

    }

    return true;

  }, true);

  if (!isValid) {

    return false;

  }

  const finYearsCopy = [ ...finYears ];
  finYearsCopy.sort((finYear1: any, finYear2: any): number => {

    return moment(finYear1.startDate, DATE_FORMAT, true).diff(moment(finYear2.startDate, DATE_FORMAT, true));

  });
  const isInOrder = finYearsCopy.every((element: any, index, array: any) => {

    if (index === 0) {

      return true;

    }
    return moment(element.startDate, DATE_FORMAT, true).isAfter(moment(array[index - 1].endDate, DATE_FORMAT, true));

  });
  return isInOrder;

};

const companyBranchSchemaDef: SchemaDef<CompanyBranchS> = {

  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    trim: true,
    index: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  addressLine1: {
    type: String,
    index: true,
    trim: true,
  },
  addressLine2: {
    type: String,
    index: true,
    trim: true,
  },
  addressLine3: {
    type: String,
    index: true,
    trim: true,
  },
  addressLine4: {
    type: String,
    index: true,
    trim: true,
  },
  contact: {
    type: String,
    index: true,
    trim: true,
    validate: {
      validator: validateMobile,
      message: (props) => {

        return `${props.value} is not a valid 'Contact Number'.`;

      }
    }
  },
  phone: {
    type: String,
    index: true,
    trim: true,
    validate: {
      validator: validateMobile,
      message: (props) => {

        return `${props.value} is not a valid 'Phone Number'.`;

      }
    }
  },
  country: {
    type: String,
    index: true,
    trim: true,
  },
  state: {
    type: String,
    index: true,
    trim: true,
  },
  email: {
    type: String,
    index: true,
    trim: true,
    validate: {
      validator: validateEmail,
      message: (props) => {

        return `${props.value} is not a valid 'Email Id`;

      }
    }
  },
  pincode: {
    type: String,
    index: true,
    trim: true,
  },
  finYears: {
    type: [ {
      name: {
        type: String,
        required: true,
        trim: true,
        index: true,
        sparse: true,
      },
      startDate: {
        type: String,
        required: true,
        trim: true,
        index: true,
        sparse: true,
      },
      endDate: {
        type: String,
        required: true,
        trim: true,
        index: true,
        sparse: true,
      }
    } ],
    required: [ true, 'Financial year ' ],
    validate: validateFinancialYear
  }
};
const companyBranchSchema = new Schema(companyBranchSchemaDef);

export default model<CompanyBranchDoc>('CompanyBranch', companyBranchSchema);
