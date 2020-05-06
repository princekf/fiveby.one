import { Document, Schema, model } from 'mongoose';
import { SchemaDef } from '../../../types';
import {TaxS} from 'fivebyone';

// Declare model interface
interface TaxDoc extends TaxS, Document {}

const taxSchemaDef: SchemaDef<TaxS> = {
  groupName: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  effectiveFrom: [
    {
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      percentage: {
        type: Number,
        required: true,
      }
    }
  ]
};

// Define model schema
const taxSchema = new Schema(taxSchemaDef);

export default model<TaxDoc>('Tax', taxSchema);
