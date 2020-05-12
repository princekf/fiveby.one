import { Document, Schema, model } from 'mongoose';
import { SchemaDef } from '../../../types';
import { UnitS } from 'fivebyone';

// Declare model interface
interface UnitDoc extends UnitS, Document {}

const unitSchemaDef: SchemaDef<UnitS> = {

  name: {
    type: String,
    required: true,
    unique: true,
  },
  shortName: {
    type: String,
    required: true,
    unique: true,
  },
  baseUnit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: false,
  },
  times: {
    type: Number,
    required: false,
  },
  decimalPlaces: {
    type: Number,
    required: true,
  },
  ancestors: {
    type: [ String ],
    required: false,
    index: true,
  }
};

// Define model schema
const unitSchema = new Schema(unitSchemaDef);

export default model<UnitDoc>('Unit', unitSchema);
