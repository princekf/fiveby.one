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
    validate: {
      validator: (val: number): boolean => {

        /* eslint no-magic-numbers: 0 */
        return [ 0, 1, 2, 3 ].indexOf(val) > -1;

      },
    }
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
