interface EffectiveFrom {
  startDate: string;
  endDate: string;
  percentage: number;
}
export interface TaxS {
  groupName: string;
  name: string;
  effectiveFrom: EffectiveFrom[];
}

export interface Tax extends TaxS {
  _id: string;
}
