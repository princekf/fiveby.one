import React, { Component } from 'react';
import { Button, Col, Input, Row, Table, Form, Select, Checkbox } from 'antd';

const { Option } = Select;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const tailLayout = {
  wrapperCol: {
    offset: 12,
    span: 12,
  },
};

export class LedgerGroup extends Component {

  private inputAreaOne = () => {

    return (
      <Col span={12} style={{ padding: '0 15px',
        boxSizing: 'border-box'}}>
        <Form.Item name='name'label='Name'>
          <Input placeholder='Enter ledger group name'/>
        </Form.Item>
        <Form.Item name='alias' label='Alias'>
          <Input placeholder='Enter ledger group alias'/>
        </Form.Item>
        <Form.Item name='parent' label='Parent'>
          <Select showSearch={true} allowClear={true}

            /*
             * FilterOption={(input, option) => {
             *   return option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
             * }}
             */
          >
            {/* {this.state.productGroups.map((productGroup) => {
              return <Option key={productGroup._id} value={productGroup._id}>{productGroup.name}</Option>;
            }
            )} */}
            <Option value='option1'>option1</Option>
            <Option value='option2'>option1</Option>
            <Option value='option3'>option1</Option>
          </Select>
        </Form.Item>
      </Col>

    );

  };

  private inputAreaTwo = () => {

    return (

      <Col span={12} style={{ padding: '0 15px',
        boxSizing: 'border-box'}}>
        <Form.Item
          name='address'
        >
          <Checkbox>Ledger Property</Checkbox>
        </Form.Item>
        <Form.Item
          name='billbybill'
        >
          <Checkbox>Maintain Bill By Bill</Checkbox>
        </Form.Item>
        <Form.Item
          name='credit'
        >
          <Checkbox>Credit Amount</Checkbox>
        </Form.Item>
        <Form.Item
          name='tin'
        >
          <Checkbox>TIN Ledger</Checkbox>
        </Form.Item>
      </Col>
    );

  };

  render() {

    return (
      <>
        <Form
          {...layout}
          name='advanced_search'
          size='small'
          style={{ margin: 'auto',
            width: '100%'}}
        >
          <Row style={{ display: 'flex'}}>
            <Col span={24} style={{ display: 'flex'}}>
              {this.inputAreaOne()}
              {this.inputAreaTwo()}
            </Col>
            <Form.Item {...tailLayout}
              style={{width: '100%'}}
            >
              <Button type='primary'>Submit</Button>
            </Form.Item>
            <Col span={24}>
              <Table/>
            </Col>
          </Row>
        </Form>
      </>
    );

  }

}

export default LedgerGroup;
