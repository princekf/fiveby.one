import { ProductGroup } from './ProductGroup';

export interface ProductS {
  group: ProductGroup;
  name: string;
  code: string;
  shortName: string;
  brand: string;
  location: string;
  barcode: string;
  unit: string;
  reorderLevel: number;
  colors: string[];
  hasBatch: boolean;
}

export interface Product extends ProductS {
  _id: string;
}
