import { Document, Schema, connection, Model } from 'mongoose';
import { ProductGroupS } from 'fivebyone';

// Declare model interface
interface ProductGroupDoc extends ProductGroupS, Document { }

export class ProductGroupModel {

  private static productSchema = new Schema<ProductGroupDoc> ({
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
      type: [ String ],
      required: false,
      index: true,
    }
  });

  public static createModel = (dbName: string): Model<ProductGroupDoc, {}> => {

    const mongoConnection = connection.useDb(dbName);
    return mongoConnection.model('ProductGroup', ProductGroupModel.productSchema);

  }

}
