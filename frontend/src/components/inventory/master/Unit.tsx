import React, { Component } from 'react';
import { Button, Col, Input, Row, Table, Select, Form } from 'antd';
import './Style.scss';

const dataSource = [
  {
    key: '1',
    name: 'Classmate Note book 100p',
    shortName: 'Book',
    Parent: 'Lorem Ipsum'
  },
  {
    key: '2',
    name: 'Classmate Note book 100p',
    shortName: 'Book',
    Parent: 'Lorem Ipsum'
  },
  {
    key: '3',
    name: 'Classmate Note book 100p',
    shortName: 'Book',
    Parent: 'Lorem Ipsum'
  },

];

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: '20%',
  },
  {
    title: 'Short Name',
    dataIndex: 'shortName',
    key: 'shortName',
  },
  {
    title: 'Parent',
    dataIndex: 'Parent',
    key: 'Parent',
  },
];

const { Option } = Select;

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

const UnitFormInput = function() {

  return (
    <>
      <Row>
        <Col span={12}>
          <Form.Item
            name='name'
            label='Name'
            rules={[
              {
                required: true,
                message: 'Name required!',
              },
            ]}
          >
            <Input.Search placeholder='Name' />
          </Form.Item>
          <Form.Item
            name='short name'
            label='Short Name'
          >
            <Input.Search placeholder='Short Name' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='base unit'
            label='Base Unit'
          >
            <Input.Search placeholder='Base Unit' />
          </Form.Item>
          <Form.Item
            name='times'
            label='Times'
          >
            <Input.Search placeholder='Times' />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

};

const UnitForm = function() {

  return (
    <Form
      {...layout}
      name='advanced_search'
      size='small'
      style={{ margin: 'auto',
        width: '100%'}}
    >
      <UnitFormInput/>
      {/* <Form.Item
        name='hasFraction'
        label='Fraction Allowed'
      >
        <Checkbox />
      </Form.Item> */}
      <Col span={12}>
        <Form.Item
          name='decimal'
          label='Decimal Places'
        >
          <Select defaultValue='0' style={{ width: 120 }}>
            <Option value='0'>0</Option>
            <Option value='1'>1</Option>
            <Option value='2'>2</Option>
            <Option value='3'>3</Option>
          </Select>
        </Form.Item>
      </Col>
      <Form.Item {...tailLayout}>
        <Button className='button' type='primary'>Delete</Button>
        <Button className='button' type='primary'>Reset</Button>
        <Button className='button' type='primary'>Submit</Button>
      </Form.Item>
    </Form>
  );

};

export class Unit extends Component {

  render() {

    return (
      <div>
        <Row style={{ display: 'flex'}}>
          <UnitForm/>
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
      </div>
    );

  }

}

export default Unit;
