import React, { Component } from 'react';
import { Button, Col, Input, Row, Table, Checkbox } from 'antd';
import './Style.scss';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

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

const InputAreaOne = function() {

  return (
    <Col span={12} style={{ padding: '0 15px',
      boxSizing: 'border-box'}}>
      <Col className='box'>
        <h4 className='text'>Code</h4>
        <Input placeholder='Code'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Short Name</h4>
        <Input placeholder='Short Name'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Group</h4>
        <Input placeholder='Group'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>HSN Code</h4>
        <Input placeholder='HSN Code'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Reorder level</h4>
        <Input placeholder='Reorder level'/>
      </Col>
    </Col>

  );

};

const InputAreaTwo = function() {

  return (

    <Col span={12} style={{ padding: '0 15px',
      boxSizing: 'border-box'}}>
      <Col className='box'>
        <h4 className='text'>Name</h4>
        <Input placeholder='Name'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Brand</h4>
        <Input placeholder='Brand'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Location</h4>
        <Input placeholder='Location'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Unit Packing</h4>
        <Input placeholder='Unit Packing'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Color</h4>
        <Input placeholder='Color'/>
      </Col>
    </Col>
  );

};
export class Product extends Component {

  render() {

    return (
      <div>
        <Row style={{ display: 'flex'}}>
          <Col span={24} style={{ display: 'flex'}}>
            <InputAreaOne/>
            <InputAreaTwo/>
          </Col>
          <Col span={24} className='box' style={{display: 'flex',
            paddingLeft: '15px',
            margin: '10px 0'}}>
            <h4 className='text' style={{width: 'auto'}}>Maintain in Batch</h4>
            <Checkbox></Checkbox>
          </Col>
          <Col span={24} className='box submit' style={{display: 'flex',
            justifyContent: 'flex-end',
            paddingRight: '30px'}}>
            <Button type='primary'>Submit</Button>
          </Col>
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

export default Product;
