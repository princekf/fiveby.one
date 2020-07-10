/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "$" }], no-eval: 0 */

export interface RuleCondition {
  type?: string;
  fact?: string;
  operator?: string;
  value?: any;
  conditions?: RuleCondition[];
}
export interface RuleEvent {
  name: string;
  value?: any;
}
export interface RuleResult {
  result: boolean;
  params?: RuleEvent[];
}
const TYPE_ANY = 'any';
const TYPE_ALL = 'all';

export default class FBORuleEngine {

  private condition?: RuleCondition;

  private fact?: any;

  private events?: RuleEvent[];

  private applyOperator = (lhs: any, operator: string, rhs: any): any => {

    if (operator === 'equal') {

      return lhs === rhs;

    }
    if (operator === 'lessOrEqual') {

      return lhs <= rhs;

    }
    if (operator === 'greaterOrEqual') {

      return lhs >= rhs;

    }
    if (operator === 'lessThan') {

      return lhs < rhs;

    }
    if (operator === 'greaterThan') {

      return lhs > rhs;

    }

    throw new Error('Unsupported operation.');

  };

  private evaluateRuleAND = (conditions: RuleCondition[]): boolean => {

    const val = conditions.reduce((previousValue: boolean, condition: RuleCondition): boolean => {

      if (condition.type) {

        return previousValue && this._evaluateRule(condition);

      }

      if (!condition.operator) {

        throw new Error('missing condition operator.');

      }
      const $ = this.fact;
      return previousValue && this.applyOperator(eval(`${condition.fact}`), condition.operator, condition.value);

    }, true);

    return val;

  }

  private evaluateRuleOR = (conditions: RuleCondition[]): boolean => {

    const val = conditions.reduce((previousValue: boolean, condition: RuleCondition): boolean => {

      if (condition.type) {

        return previousValue || this._evaluateRule(condition);

      }

      if (!condition.operator) {

        throw new Error('missing condition operator.');

      }
      const $ = this.fact;
      return previousValue || this.applyOperator(eval(`${condition.fact}`), condition.operator, condition.value);

    }, false);

    return val;

  }

  private _evaluateRule = (condition: RuleCondition): boolean => {

    if (!condition.conditions || condition.conditions.length === 0) {

      return true;

    }

    if (condition.type === TYPE_ALL) {

      return this.evaluateRuleAND(condition.conditions);

    }

    if (condition.type === TYPE_ANY) {

      return this.evaluateRuleOR(condition.conditions);

    }

    return false;

  }

  /**
   * SetCondition
   */
  public setCondition(condition: RuleCondition) {

    this.condition = condition;

  }

  /**
   * SetFact
   */
  public setFact(fact: any) {

    this.fact = fact;

  }

  /**
   * SetEvents
   */
  public setEvents(events: RuleEvent[]) {

    this.events = events;

  }

  /**
   * EvaluateRule
   */
  public evaluateRule(): RuleResult {

    if (!this.condition) {

      throw new Error('Add condition to evaluate the rule.');

    }

    if (!this.fact) {

      throw new Error('Add fact to evaluate the rule.');

    }

    if (!this.events) {

      throw new Error('Add events to evaluate the rule.');

    }
    const result = this._evaluateRule(this.condition);
    const params: RuleEvent[] = [];
    const ret = {result,
      params};
    if (!result) {

      return ret;

    }
    const $ = this.fact;
    this.events.map((event) => {

      return params.push({name: event.name,
        value: eval(event.value)});

    });
    return ret;

  }

}
