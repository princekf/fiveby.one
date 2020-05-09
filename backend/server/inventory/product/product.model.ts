import { Document, Schema, model } from 'mongoose';
import { SchemaDef } from '../../../types';
import { ProductS } from 'fivebyone';

// Declare model interface
interface ProductDoc extends ProductS, Document {}

const productSchemaDef: SchemaDef<ProductS> = {
  group: {
    type: Schema.Types.ObjectId,
    ref: 'ProductGroup',
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: false,
  },
  shortName: {
    type: String,
    required: false,
  },
  brand: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  barcode: {
    type: String,
    required: false,
  },
  unit: {
    type: String,
    required: false,
  },
  reorderLevel: {
    type: Number,
    required: false,
  },
  colors: {
    type: [ String ],
    required: false,
    index: true,
  },
  hasBatch: {
    type: Boolean,
    required: false,
  }
};

// Define model schema
const productSchema = new Schema(productSchemaDef);

export default model<ProductDoc>('Product', productSchema);
