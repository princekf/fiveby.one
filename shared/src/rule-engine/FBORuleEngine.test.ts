/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */

import FBORuleEngine, {RuleCondition, RuleEvent, RuleResult } from './FBORuleEngine';

describe('Rule Engine Test', () => {

  it('Validate a simple rule', () => {

    const fRule = new FBORuleEngine();
    const condition: RuleCondition = {
      type: 'all',
      conditions: [
        {
          fact: '$.billingAddress.state',
          operator: 'equal',
          value: 'Kerala'
        },
        {
          fact: '$.quantity',
          operator: 'lessOrEqual',
          value: 10,
        },
        {
          fact: '$.amount',
          operator: 'greaterOrEqual',
          value: 100,
        }
      ]
    };
    const transaction = {
      date: '2020-06-24',
      billingAddress: {
        state: 'Kerala',
      },
      product: {
        code: '10110101',
        brand: 'LG'
      },
      quantity: 10,
      amount: 100,
    };
    const events = [
      {
        name: 'CGST',
        value: '$.amount * $.quantity * .09'
      },
      {
        name: 'SGST',
        value: '$.amount * $.quantity * .09'
      }
    ];
    fRule.setCondition(condition);
    fRule.setFact(transaction);
    fRule.setEvents(events);
    const ret = fRule.evaluateRule();
    expect(ret.result).toBe(true);

  });


  it('Validate 2 layer rule', () => {

    const fRule = new FBORuleEngine();
    const condition: RuleCondition = {
      type: 'all',
      conditions: [
        {
          fact: '$.billingAddress.state',
          operator: 'equal',
          value: 'Kerala'
        },
        {
          type: 'any',
          conditions: [ {
            fact: '$.quantity',
            operator: 'lessOrEqual',
            value: 10,
          },
          {
            fact: '$.amount',
            operator: 'greaterOrEqual',
            value: 100,
          } ]
        }
      ]
    };
    const transaction = {
      date: '2020-06-24',
      billingAddress: {
        state: 'Kerala',
      },
      product: {
        code: '10110101',
        brand: 'LG'
      },
      quantity: 10,
      amount: 90,
    };
    const events: RuleEvent[] = [
      {
        name: 'CGST',
        value: '$.amount * $.quantity * .09'
      },
      {
        name: 'SGST',
        value: '$.amount * $.quantity * .09'
      }
    ];
    fRule.setCondition(condition);
    fRule.setFact(transaction);
    fRule.setEvents(events);
    const ret: RuleResult = fRule.evaluateRule();
    expect(ret.result).toBe(true);

  });

});
