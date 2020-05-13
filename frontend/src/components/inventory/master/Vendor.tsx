import React, { Component } from 'react';
import { Button, Col, Input, Row, Table, Form, DatePicker } from 'antd';
import './Style.scss';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;


const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
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

const dataSource = [
  {
    key: '1',
    code: 'Code 1',
    name: 'Name',
    nature: 'Group1',
    telephone: 9747558023
  },
  {
    key: '2',
    code: 'Code 2',
    name: 'Name',
    nature: 'Group2',
    telephone: 9747558023
  },
  {
    key: '3',
    code: 'Code 3',
    name: 'Name',
    nature: 'Group3',
    telephone: 9747558023
  },

];

const columns = [
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: '20%',
  },
  {
    title: 'Nature',
    dataIndex: 'nature',
    key: 'nature',
  },
  {
    title: 'Telephone',
    dataIndex: 'telephone',
    key: 'telephone',
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render() {

      return (
        <div style={{ display: 'flex',
          alignItems: 'center' }}>
          <EditOutlined style={{marginRight: '10px',
            cursor: 'pointer'}}/>
          <DeleteOutlined style={{marginRight: '10px',
            cursor: 'pointer'}}/>
        </div>
      );

    },
  },
];

const dateFormatList = [ 'DD/MM/YYYY', 'DD/MM/YY' ];

const TaxDateArea = function() {

  return (
    <Col className='box' style={{display: 'flex',
      justifyContent: 'flex-end'}}>
      <Form.Item
        {...layout1}
        name='TaxReg.no.'
        label='Tax Reg. no.'
        style={{marginRight: '10px',
          display: 'block'}}
      >
        <Input placeholder='Tax Reg. no.'/>
      </Form.Item>
      <Form.Item
        {...layout1}
        name='expiryDate'
        label='Expiry Date'
        style={{marginLeft: '10px',
          display: 'block'}}
      >
        <DatePicker defaultValue={moment('01/01/2015', dateFormatList[0])} format={dateFormatList} />
      </Form.Item>
    </Col>
  );

};

const InputAreaOne = function() {

  return (
    <Col span={12} style={{ padding: '0 15px',
      boxSizing: 'border-box'}}>
      <Form.Item
        name='nature'
        label='Nature'
      >
        <Input placeholder='Nature'/>
      </Form.Item>
      <Form.Item
        name='code'
        label='Code'
      >
        <Input placeholder='Code'/>
      </Form.Item>
      <Form.Item
        name='name'
        label='Name'
      >
        <Input placeholder='Name'/>
      </Form.Item>
      <Form.Item
        name='email_id'
        label='Email id'
      >
        <Input placeholder='Email id'/>
      </Form.Item>
      <Form.Item
        name='telNumbers'
        label='Tel Numbers'
      >
        <Input placeholder='Tel Numbers'/>
      </Form.Item>
      <TaxDateArea/>
    </Col>

  );

};

const InputAreaTwo = function() {

  return (

    <Col span={12} style={{ padding: '0 15px',
      boxSizing: 'border-box'}}>
      <Form.Item
        name='address'
        label='Customer Address'
      >
        <TextArea rows={5} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name='state'
        label='State'
      >
        <Input placeholder='State'/>
      </Form.Item>
      <Form.Item
        name='country'
        label='Country'
      >
        <Input placeholder='Country'/>
      </Form.Item>
    </Col>
  );

};
export class Vendor extends Component {

  render() {

    return (
      <div>
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
            <Form.Item {...tailLayout}
              style={{width: '100%'}}
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
      </div>
    );

  }

}

export default Vendor;
