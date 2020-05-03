declare namespace App {
  interface ProductSale {
    _id: any;
    productId: string;
    name: string;
    barcode: string;
    price: number;
    quantity: number;
    discount: number;
    tax: number;
    total: number;
  }
}
