import React, { Component } from 'react';
import { Button, Col, Input, Row, Table, Form, DatePicker, Select, Checkbox, Switch } from 'antd';
import moment from 'moment';

const { Option } = Select;

const { TextArea } = Input;
const dateFormatList = [ 'DD/MM/YYYY', 'DD/MM/YY' ];


const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const layout1 = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

const layout2 = {
  labelCol: { span: 18 },
  wrapperCol: { span: 6 },
};

const tailLayout = {
  wrapperCol: {
    offset: 12,
    span: 12,
  },
};

export class Ledger extends Component {

  private inputAreaOne = () => {

    return (
      <Col span={12} style={{ padding: '0 15px',
        boxSizing: 'border-box'}}>
        <Form.Item name='name'label='Name'>
          <Input placeholder='Enter ledger name'/>
        </Form.Item>
        <Form.Item name='alias' label='Alias'>
          <Input placeholder='Enter ledger alias'/>
        </Form.Item>
        <Form.Item name='parent' label='Parent Group'>
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
        <Form.Item name='remark' label='Remark'>
          <TextArea rows={3} style={{ width: '100%' }}/>
        </Form.Item>
        <Col style={{display: 'flex',
          justifyContent: 'space-between'}}>
          <Form.Item name='costCenter' label='Apply cost center' {...layout2} >
            <Checkbox style={{marginLeft: '10px'}}/>
          </Form.Item>
          <Form.Item name='status' label='Status' style={{display: 'block'}} {...layout1}>
            <Switch/>
          </Form.Item>
        </Col>
        <Form.Item name='opening' label='Opening'>
          <Input placeholder='Enter ledger opening'/>
        </Form.Item>
      </Col>
    );

  };

  private inputAreaTwo = () => {

    return (
      <Col span={12} style={{ padding: '0 15px',
        boxSizing: 'border-box'}}>
        <Form.Item name='mailingAddress' label='Mailing Address'>
          <TextArea rows={5} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name='country' label='Country'>
          <Input placeholder='Country'/>
        </Form.Item>
        <Form.Item name='state'label='State'>
          <Input placeholder='State'/>
        </Form.Item>
        <Form.Item name='pinCode' label='PIN Code'>
          <Input placeholder='Country'/>
        </Form.Item>
        <Form.Item name='ason'label='AS on'>
          <DatePicker defaultValue={moment('01/01/2015', dateFormatList[0])} format={dateFormatList} />
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

export default Ledger;
