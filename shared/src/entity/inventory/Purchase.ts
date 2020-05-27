import {Party} from './Party';
import {Product} from './Product';
import {Unit} from './Unit';
import {Tax} from './Tax';

interface PurchaseItem {
  product: Product;
  unitPrice: number;
  quantity: number;
  unit: Unit;
  discount: number;
  taxes: Tax[];
  totalTax: number;
  totalAmount: number;
  batchNumber: string;
  expirtyDate: string;
  mfgDate: string;
  mrp: number;
}

export interface PurchaseS{
  purchaseDate: string;
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  orderDate: string;
  party: Party;
  totalAmount: number;
  totalDiscount: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  narration: string;
  purchaseItems: PurchaseItem[];
}

export interface Purchase extends PurchaseS {
  _id: string;
}
