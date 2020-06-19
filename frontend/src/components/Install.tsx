import React, { Component } from 'react';
import { Button, Col, Input, Row, Table, Form, Space } from 'antd';

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

export class Install extends Component {

  private inputAreaOne = () => {

    return (
      <Col span={12} style={{ padding: '0 15px',
        boxSizing: 'border-box'}}>
        <Form.Item name='name'label='Name'>
          <Input placeholder='Enter admin name'/>
        </Form.Item>
        <Form.Item name='email'label='Email'>
          <Input placeholder='Enter admin email'/>
        </Form.Item>
        <Form.Item name='mobile'label='Mobile'>
          <Input placeholder='Enter admin mobile'/>
        </Form.Item>
        <Form.Item name='password'label='Password'>
          <Input.Password/>
        </Form.Item>
        <Form.Item name='confirm_password'label='Confirm Password'>
          <Input.Password/>
        </Form.Item>
      </Col>

    );

  };

  private renderButtonPanel = () => {

    return (
      <Form.Item {...tailLayout} style={{ width: '100%' }}>
        <Space size='large'>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
          <Button type='primary' htmlType='reset'>
            Reset
          </Button>
        </Space>
      </Form.Item>
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
            </Col>
            {this.renderButtonPanel()}
            <Col span={24}>
              <Table/>
            </Col>
          </Row>
        </Form>
      </>
    );

  }

}

export default Install;
