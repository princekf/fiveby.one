declare module App {
  interface ProductSale {
    _id: any;
    product_id: string;
    name: string;
    barcode: string;
    price: number;
    quantity: number;
    discount: number;
    tax: number;
    total: number;
  }
}
