import React, { Component } from 'react';
import { Button, Col, Input, Row, Table } from 'antd';
import './Style.scss';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';

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

const InputAreaOne = function() {

  return (
    <Col span={12} style={{ padding: '0 15px',
      boxSizing: 'border-box'}}>
      <Col className='box'>
        <h4 className='text'>Nature</h4>
        <Input placeholder='Code'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Code</h4>
        <Input placeholder='Short Name'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Name</h4>
        <Input placeholder='Group'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Email id</h4>
        <Input placeholder='HSN Code'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Tel Numbers</h4>
        <Input placeholder='Reorder level'/>
      </Col>
      <Col className='box' style={{display: 'flex'}}>
        <Col style={{display: 'flex'}}>
          <h4 className='text'>Tax Reg. no.</h4>
          <Input placeholder='Reorder level'/>
        </Col>
        <Col style={{display: 'flex'}}>
          <h4 className='text'>Expiry Date</h4>
          <Input placeholder='Reorder level'/>
        </Col>
      </Col>
    </Col>

  );

};

const InputAreaTwo = function() {

  return (

    <Col span={12} style={{ padding: '0 15px',
      boxSizing: 'border-box'}}>
      <h4 className='text'>Customer Address</h4>
      <TextArea rows={5} style={{ width: '100%' }} />
      <Col className='box' style={{marginTop: '15px'}}>
        <h4 className='text'>Tel Numbers</h4>
        <Input placeholder='Reorder level'/>
      </Col>

    </Col>
  );

};
export class Vendor extends Component {

  render() {

    return (
      <div>
        <Row style={{ display: 'flex'}}>
          <Col span={24} style={{ display: 'flex'}}>
            <InputAreaOne/>
            <InputAreaTwo/>
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

export default Vendor;
