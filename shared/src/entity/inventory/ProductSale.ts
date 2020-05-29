export interface ProductSaleS {
  productId: string;
  name: string;
  barcode: string;
  price: number;
  quantity: number;
  discount: number;
  tax: number;
  total: number;
}

export interface ProductSale extends ProductSaleS {
  _id: string;
}
