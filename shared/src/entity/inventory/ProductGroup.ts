export interface ProductGroupS {
  name: string;
  shortName: string;
  parent: string;
  ancestors: string[];
}

export interface ProductGroup extends ProductGroupS {
  _id: string;
}
