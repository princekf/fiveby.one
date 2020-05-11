import React, { Component } from 'react';
import { Button, Col, Input, Row, Table, DatePicker, InputNumber, Form } from 'antd';
import './Style.scss';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const dataSource = [
  {
    key: '1',
    name: 'Name',
    actualName: 'actualName1',
    effectiveFrom: '10/02/2020'
  },
  {
    key: '2',
    name: 'Name',
    actualName: 'actualName2',
    effectiveFrom: '10/02/2020'
  },
  {
    key: '3',
    name: 'Name',
    actualName: 'actualName3',
    effectiveFrom: '10/02/2020'
  },

];

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Actual Name',
    dataIndex: 'actualName',
    key: 'actualName',
  },
  {
    title: 'Effective From',
    dataIndex: 'effectiveFrom',
    key: 'effectiveFrom',
  },
];

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const layout1 = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

const tailLayout = {
  wrapperCol: {
    offset: 12,
    span: 12,
  },
};

const InputAreaOne = function() {

  return (
    <Col span={12} style={{ padding: '0 15px',
      boxSizing: 'border-box'}}>
      <Form.Item
        name='name'
        label='Name'
      >
        <Input placeholder='Name' />
      </Form.Item>
      <Form.Item
        name='actual name'
        label='Actual Name'
      >
        <Input placeholder='Actual Name' />
      </Form.Item>
      <Form.Item
        name='print name'
        label='Print Name'
      >
        <Input placeholder='Print Name' />
      </Form.Item>
    </Col>

  );

};

const InputAreaTwo = function() {

  return (

    <Col span={12} style={{ padding: '0 15px',
      boxSizing: 'border-box'}}>
      <Form.Item
        name='tax ledger'
        label='Tax Ledger'
      >
        <Input placeholder='Tax Ledger' />
      </Form.Item>
      <Form.Item
        name='sales ledger'
        label='Sales Ledger'
      >
        <Input placeholder='Sales Ledger' />
      </Form.Item>
      <Form.Item
        name='purchase ledger'
        label='Purchase Ledger'
      >
        <Input placeholder='Purchase Ledger' />
      </Form.Item>
    </Col>
  );

};

const dateFormatList = [ 'DD/MM/YYYY', 'DD/MM/YY' ];

const InputAreaThree = function() {

  return (
    <>
      <h4 className='text' style={{width: 'auto'}}>Tax Rate and Effective Rate</h4>

      <Form.Item
        {...layout1}
        name='effective from'
        label='Effective From'
        style={{display: 'block'}}
      >
        <DatePicker defaultValue={moment('01/01/2015', dateFormatList[0])} format={dateFormatList} />
      </Form.Item>

      <Form.Item
        {...layout1}
        name='tax rate'
        label='Tax Rate'
        style={{display: 'block'}}
      >
        <InputNumber min={1} max={100000} />
      </Form.Item>

      <Form.Item
        style={{display: 'flex',
          width: '150px',
          paddingTop: '30px'}}
      >
        <Button shape='circle' icon={<MinusCircleOutlined />} style={{margin: '0 10px'}}></Button>
        <Button shape='circle' icon={<PlusCircleOutlined />}></Button>
      </Form.Item>
    </>
  );

};


export class Tax extends Component {

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
              <InputAreaOne/>
              <InputAreaTwo/>
            </Col>
            <Col span={24} className='box' style={{display: 'flex',
              paddingLeft: '15px',
              margin: '10px 0'}}>
              <InputAreaThree/>
            </Col>
            <Form.Item {...tailLayout}
              style={{display: 'flex',
                justifyContent: 'center',
                width: '100%'}}
            >
              <Button type='primary'>Submit</Button>
            </Form.Item>
            <Col span={24}>
              <Table
                dataSource={dataSource}
                columns={columns}
                scroll={{ y: 240 }}
                pagination={{
                  total: dataSource.length,
                  pageSize: dataSource.length,
                  hideOnSinglePage: true,
                }}
              />
            </Col>
          </Row>
        </Form>

      </>
    );

  }

}

export default Tax;
