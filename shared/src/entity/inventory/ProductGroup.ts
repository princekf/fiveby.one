import { RuleCondition, RuleEvent } from '../../rule-engine/FBORuleEngine';

export interface ProductGroupS {
  name: string;
  shortName: string;
  parent: ProductGroup;
  ancestors: ProductGroup[];
  taxRules: [
    {
      condition: RuleCondition;
      events: RuleEvent;
      startDate: string;
      endDate: string;
    }
  ];
}

export interface ProductGroup extends ProductGroupS {
  _id: string;
}
