import { Document, Schema, model } from 'mongoose';
import { SchemaDef } from '../../../types';
import {PartyS} from 'fivebyone';
// Declare model interface
interface PartyDoc extends PartyS, Document {}

const validateCode = (code2: string): boolean => {

  if (!code2 || code2.trim() === '') {

    return false;

  }
  return true;

};

const partySchemaDef: SchemaDef<PartyS> = {
  name: {
    type: String,
    trim: true,
    index: true,
    required: true,
  },
  code: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    sparse: true,
    validate: {
      validator: validateCode,
      message: (props) => {

        return `${props.value} is not a valid code!`;

      }
    },
  },
  mobile: {
    trim: true,
    index: true,
    unique: true,
    sparse: true,
    type: String,
  },
  email: {
    trim: true,
    index: true,
    unique: true,
    sparse: true,
    type: String,
  },
  isCustomer: {
    type: Boolean,
  },
  isVendor: {
    type: Boolean,
  },
  adresses: {
    type: [ {
      type: {
        type: String,
      },
      addressLine1: {
        type: String,
      },
      addressLine2: {
        type: String,
      },
      addressLine3: {
        type: String,
      },
      addressLine4: {
        type: String,
      },
      state: {
        type: String,
      },
      country: {
        type: String,
      },
      pinCode: {
        type: String,
      },
      landMark: {
        type: String,
      },
    } ],
    required: true,

    validate: {
      validator: (adrss: []): boolean => {

        return adrss && adrss.length > 0;

      },
      message: () => {

        return 'Adress is required.';

      }
    },
  },
  registrationNumbers: {
    type: [
      {
        name: {
          type: String,
        },
        value: {
          type: String,
        },
      }
    ]
  }
};

// Define model schema
const partySchema = new Schema(partySchemaDef);

export default model<PartyDoc>('Party', partySchema);
