
import React from 'react';
import {Greeter2 as greeter2, Constants} from 'fivebyone';
const {Component} = React;
const {HTTP_OK, HTTP_NOT_FOUND} = Constants;
class TestComponent extends Component {

  public render() {

    const greetings = greeter2('Prince');
    return (
      <div>
        {greetings} {HTTP_OK} {HTTP_NOT_FOUND}
      </div>
    );

  }

}
export default TestComponent;
