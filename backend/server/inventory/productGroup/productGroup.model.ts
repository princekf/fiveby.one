import { Document, Schema, connection, Model } from 'mongoose';
import { ProductGroupS, ProductGroup, Constants } from 'fivebyone';
import moment = require('moment');
const {DATE_FORMAT} = Constants;

// Declare model interface
interface ProductGroupDoc extends ProductGroupS, Document { }

const validateDate = (productGroup: ProductGroup): boolean => {

  if (!productGroup.taxRules) {

    return true;

  }

  const isValid = productGroup.taxRules.reduce((_result: boolean, item: any): boolean => {

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

  return Boolean(isValid);

};

export class ProductGroupModel {

  private static productSchema = new Schema<ProductGroupDoc>({
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    shortName: {
      type: String,
      required: false,
      trim: true,
      index: true,
      sparse: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'ProductGroup',
      required: false,
    },
    ancestors: {
      type: [ {
        type: Schema.Types.ObjectId,
        ref: 'ProductGroup'
      } ],
      required: false,
      index: true,
    },
    taxRules: {
      type: [
        {
          condition: {
            type: Object,
          },
          events: {
            type: Object,
          },
          startDate: {
            type: String,

          },
          endDate: {
            type: String,
          }

        }
      ]
    }
  });

  public static createModel = (dbName: string): Model<ProductGroupDoc, {}> => {

    const mongoConnection = connection.useDb(dbName);
    ProductGroupModel.productSchema.pre<ProductGroupDoc>('validate', function() {

      const result: boolean = validateDate(this);
      if (!result) {

        throw new Error('Date validation failed for Product group');

      }

    });
    return mongoConnection.model('ProductGroup', ProductGroupModel.productSchema);

  }

}
