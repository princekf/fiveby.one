export interface TaxS {
  groupName: string;
  name: string;
  effectiveFrom: [{
    startDate: Date;
    endDate: Date;
    percentage: number;
  }];
}

export interface Tax extends TaxS {
  _id: string;
}
