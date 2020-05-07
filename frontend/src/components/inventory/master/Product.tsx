import React, { Component } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../../session';
import { Button, Col, Input, Row, Table, Switch, Form, message, Select, InputNumber} from 'antd';
import './Style.scss';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {Constants} from 'fivebyone';

const {HTTP_OK} = Constants;

const dataSource = [
  {
    key: '1',
    code: 'Code 1',
    name: 'Name',
    group: 'Group1'
  },
  {
    key: '2',
    code: 'Code 2',
    name: 'Name',
    group: 'Group2'
  },
  {
    key: '3',
    code: 'Code 3',
    name: 'Name',
    group: 'Group3'
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
    title: 'Group',
    dataIndex: 'group',
    key: 'group',
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render() {

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          <EditOutlined style={{
            marginRight: '10px',
            cursor: 'pointer'
          }} />
          <DeleteOutlined style={{
            marginRight: '10px',
            cursor: 'pointer'
          }} />
        </div>
      );

    },
  },
];

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const ProductFormRow1 = function() {

  return (
    <>
      <Col span={12}>
        <Form.Item
          name='name'
          label='Name'
          rules={[
            {
              required: true,
              message: 'Product name is required',
            },
          ]}
        >
          <Input placeholder='Name of product' />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='group'
          label='Group'
          rules={[
            {
              required: true,
              message: 'Group name is required',
            },
          ]}
        >
          <Input.Search placeholder='Name of group' />
        </Form.Item>
      </Col>

    </>
  );

};

const ProductFormRow2 = function() {

  return (
    <>

      <Col span={12}>
        <Form.Item
          name='barcode'
          label='Barcode'
          rules={[
            {
              required: true,
              message: 'Barcode is required',
            },
          ]}
        >
          <Input placeholder='Enter product barcode' />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='shortName'
          label='Short Name'
        >
          <Input placeholder='Enter product short name' />
        </Form.Item>
      </Col>
    </>
  );

};
const ProductFormRow3 = function() {

  return (
    <>
      <Col span={12}>
        <Form.Item
          name='code'
          label='HSN Code'
        >
          <Input.Search placeholder='Enter product HSN code' />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='brand'
          label='Brand'
        >
          <Input.Search placeholder='Enter product brand' />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='location'
          label='Location'
        >
          <Input.Search placeholder='Enter product location' />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='unit'
          label='Unit'
        >
          <Input.Search placeholder='Enter product unit' />
        </Form.Item>
      </Col>
    </>
  );

};
const ProductFormRow4 = function() {

  return (
    <>
      <Col span={12}>
        <Form.Item
          name='reorderLevel'
          label='Re-Order Level'
        >
          <InputNumber placeholder='Enter product re order level' />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='colors'
          label='Colors'
        >
          <Select mode='tags' placeholder='Select colors' allowClear={true}>
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='hasBatch'
          label='Maintain in Batch'
        >
          <Switch />
        </Form.Item>
      </Col>
    </>
  );

};

const ProductForm = function() {

  return (
    <>
      <Row gutter={24}>
        <ProductFormRow1/>
        <ProductFormRow2/>
        <ProductFormRow3/>
        <ProductFormRow4/>
      </Row>
      <Form.Item {...tailLayout}>
        <Button type='primary' htmlType='submit'>
            Submit
        </Button>
      </Form.Item>
    </>
  );

};
export class Product extends Component {

  private handlePoductUpdate = async(values: any): Promise<void> => {

    const hideLodingMessage = message.loading('Updating product into server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      const response = await axios.post<{ token: string; expiry: string }>('/api/products', values, { headers: getAuthHeaders() });
      if (response.status !== HTTP_OK) {

        message.error('Product update failes, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }

    } catch (error) {

      message.error('Product update failes, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }

  };


  render() {

    return (
      <>
        <Form
          {...layout}
          name='advanced_search'
          size='small'
          onFinish={this.handlePoductUpdate}
        >
          <ProductForm />
        </Form>
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
      </>
    );

  }

}

export default Product;
