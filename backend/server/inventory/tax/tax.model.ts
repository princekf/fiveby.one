import { Document, Schema, model } from 'mongoose';
import { SchemaDef } from '../../../types';
import {TaxS, Constants} from 'fivebyone';
import moment = require('moment');
const {DATE_FORMAT} = Constants;
// Declare model interface
interface TaxDoc extends TaxS, Document {}

const validateEffectiveFrom = (effectiveFroms: []): boolean => {

  if (!effectiveFroms || effectiveFroms.length === 0) {

    return false;

  }
  const isValid = effectiveFroms.reduce((_result: boolean, item: any): boolean => {

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

  const effectiveFromsCopy = [ ...effectiveFroms ];
  effectiveFromsCopy.sort((item1: any, item2: any): number => {

    return moment(item1.startDate, DATE_FORMAT, true).diff(moment(item2.startDate, DATE_FORMAT, true));

  });
  const isInOrder = effectiveFromsCopy.every((element: any, index, array: any) => {

    if (index === 0) {

      return true;

    }
    return moment(element.startDate, DATE_FORMAT, true).isAfter(moment(array[index - 1].endDate, DATE_FORMAT, true));

  });
  return isInOrder;

};
const taxSchemaDef: SchemaDef<TaxS> = {


  groupName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  effectiveFrom: {
    type: [
      {
        startDate: {
          type: String,
          required: true
        },
        endDate: {
          type: String,
          required: true
        },
        percentage: {
          type: Number,
          required: true,
          min: 0,
        }
      }
    ],
    required: true,
    validate: validateEffectiveFrom,
  }
};

// Define model schema
const taxSchema = new Schema(taxSchemaDef);

export default model<TaxDoc>('Tax', taxSchema);
