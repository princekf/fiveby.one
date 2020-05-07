import { Document, Schema, model } from 'mongoose';
import { SchemaDef } from '../../../types';
import { ProductS } from 'fivebyone';

// Declare model interface
interface ProductDoc extends ProductS, Document {}

const productSchemaDef: SchemaDef<ProductS> = {
  group: {
    type: String,
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
    unique: true,
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
  },
  hasBatch: {
    type: Boolean,
    required: false,
  }
};

// Define model schema
const productSchema = new Schema(productSchemaDef);

export default model<ProductDoc>('Product', productSchema);
