declare module App {
  interface ProductM {
    name: string;
    barcode: string;
    price: number;
  }

  interface Product extends ProductM {
    _id: any;
  }
}
