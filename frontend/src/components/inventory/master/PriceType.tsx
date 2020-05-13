import React, { Component } from 'react';
import { Button, Col, Input, Table, Form } from 'antd';
import './Style.scss';

const { TextArea } = Input;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 24,
  },
};

const dataSource = [
  {
    key: '1',
    name: 'Classmate Note book 100p',
    shortName: 'Book',
    description: 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also th'
  },
  {
    key: '2',
    name: 'Classmate Note book 100p',
    shortName: 'Book',
    description: 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also th'
  },
  {
    key: '3',
    name: 'Classmate Note book 100p',
    shortName: 'Book',
    description: 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also th'
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
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
];

const InputArea = function() {

  return (
    <>
      <Form.Item
        name='name'
        label='Name'
      >
        <Input placeholder='Name'/>
      </Form.Item>
      <Form.Item
        name='shortName'
        label='Short Name'
      >
        <Input placeholder='Short Name'/>
      </Form.Item>
      <Form.Item
        name='description'
        label='Description'
      >
        <TextArea/>
      </Form.Item>
      <Form.Item {...tailLayout}
        style={{width: '100%',
          textAlign: 'center'}}
      >
        <Button className='button' type='primary'>Clear</Button>
        <Button className='button' type='primary'>Reset</Button>
        <Button className='button' type='primary'>Submit</Button>
      </Form.Item>
    </>
  );

};

export class PriceType extends Component {

  render() {

    return (
      <div>
        <Form
          {...layout}
          name='advanced_search'
          size='small'
          style={{ margin: 'auto',
            maxWidth: '600px',
            width: '100%'}}
        >
          <InputArea/>
        </Form>
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
      </div>
    );

  }

}

export default PriceType;
