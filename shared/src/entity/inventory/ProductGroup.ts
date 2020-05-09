export interface ProductGroupS {
  name: string;
  shortName: string;
  parent: ProductGroup;
  ancestors: string[];
}

export interface ProductGroup extends ProductGroupS {
  _id: string;
}
