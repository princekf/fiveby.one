import { Document, Schema, Model, connection } from 'mongoose';
import { ProductS } from 'fivebyone';

// Declare model interface
interface ProductDoc extends ProductS, Document { }
export class ProductModel {

  private static productSchema = new Schema({


    group: {
      type: Schema.Types.ObjectId,
      ref: 'ProductGroup',
      required: true,
      trim: true,
      index: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
      unique: true,
    },
    code: {
      type: String,
      required: false,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
    },
    shortName: {
      type: String,
      required: false,
      trim: true,
    },
    brand: {
      type: String,
      required: false,
      trim: true,
      index: true,
      sparse: true,
    },
    location: {
      type: String,
      required: false,
      trim: true,
      index: true,
      sparse: true,
    },
    barcode: {
      type: String,
      required: false,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
    },
    unit: {
      type: String,
      required: false,
      trim: true,
      index: true,
      sparse: true,
    },
    reorderLevel: {
      type: Number,
      required: false,
    },
    colors: {
      type: [ {
        type: String,
        index: true,
        trim: true,
      } ],
      required: false,
    },
    hasBatch: {
      type: Boolean,
      required: false,
    }
  });

  public static createModel = (dbName: string): Model<ProductDoc, {}> => {

    const mongoConnection = connection.useDb(dbName);
    return mongoConnection.model('Product', ProductModel.productSchema);

  }

}
