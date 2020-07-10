
interface Tax {
  name: string;
  rate: number;
}

export interface TaxRuleS {
  displayName: string;
  name: string;
  startDate: string;
  endDate: string;
  conditions: string;
  taxes: [{

  }];
}

export interface TaxRule extends TaxRuleS {
  _id: string;
}
