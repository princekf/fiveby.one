import { Document, Schema, model } from 'mongoose';
import { SchemaDef } from '../../../types';
import {PurchaseUtil} from './purchase.util';
import { PurchaseS } from 'fivebyone';

// Declare model interface
interface PurchaseDoc extends PurchaseS, Document {}

const purchaseSchemaDef: SchemaDef<PurchaseS> = {
  purchaseDate: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  invoiceNumber: {
    type: String,
    trim: true,
    sparse: true,
  },
  invoiceDate: {
    type: String,
    trim: true,
    sparse: true,
  },
  orderNumber: {
    type: String,
    trim: true,
    sparse: true,
  },
  orderDate: {
    type: String,
    trim: true,
    sparse: true,
  },
  party: {
    type: Schema.Types.ObjectId,
    ref: 'Party',
    required: true,
  },
  totalAmount: {
    type: Number,
  },
  totalDiscount: {
    type: Number,
  },
  totalTax: {
    type: Number,
  },
  roundOff: {
    type: Number,
  },
  grandTotal: {
    type: Number,
  },
  narration: {
    type: String,
    trim: true,
    sparse: true,
  },
  purchaseItems: {
    type: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: [ true, 'Product is requied in each purchase item.' ],
        },
        unitPrice: {
          type: Number,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          trim: true,
        },
        unit: {
          type: Schema.Types.ObjectId,
          ref: 'Unit',
          required: true,
        },
        discount: {
          type: Number,
        },
        taxes: [ {
          type: Schema.Types.ObjectId,
          ref: 'Tax',
        } ],
        totalTax: {
          type: Number,
        },
        totalAmount: {
          type: Number,
          required: true,
          trim: true,
        },
        batchNumber: {
          type: String,
        },
        expirtyDate: {
          type: String,
        },
        mfgDate: {
          type: String,
        },
        mrp: {
          type: Number,
          required: true,
        },
      }
    ]
  }
};

const validatePurchase = async function<PurchaseDoc>() {

  const result = await PurchaseUtil.validatePurchase(this);
  if (!result) {

    throw new Error('Purchase validation failed.');

  }

};

const purchaseSchema = new Schema(purchaseSchemaDef);
purchaseSchema.pre<PurchaseDoc>('save', validatePurchase);
export default model<PurchaseDoc>('Purchase', purchaseSchema);
