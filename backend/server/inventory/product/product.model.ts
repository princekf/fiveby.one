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
};

// Define model schema
const productSchema = new Schema(productSchemaDef);

export default model<ProductDoc>('Product', productSchema);
