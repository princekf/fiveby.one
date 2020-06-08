import { Document, Schema, Model, connection } from 'mongoose';
import { UnitS } from 'fivebyone';

// Declare model interface
interface UnitDoc extends UnitS, Document { }
export class UnitModel extends Document {

  // Define model schema
  private static unitSchema = new Schema<UnitDoc>({

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    shortName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
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
  });

  public static createModel = (dbName: string): Model<UnitDoc, {}> => {

    const mongoConnection = connection.useDb(dbName);
    return mongoConnection.model('Unit', UnitModel.unitSchema);

  }

}
