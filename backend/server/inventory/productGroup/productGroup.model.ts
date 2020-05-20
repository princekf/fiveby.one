import { Document, Schema, model } from 'mongoose';
import { SchemaDef } from '../../../types';
import { ProductGroupS } from 'fivebyone';

// Declare model interface
interface ProductGroupDoc extends ProductGroupS, Document {}

const productGroupSchemaDef: SchemaDef<ProductGroupS> = {

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
};

// Define model schema
const productGroupSchema = new Schema(productGroupSchemaDef);

export default model<ProductGroupDoc>('ProductGroup', productGroupSchema);
