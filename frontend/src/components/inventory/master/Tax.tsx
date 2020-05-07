import React, { Component } from 'react';
import { Button, Col, Input, Row, Table, DatePicker, InputNumber } from 'antd';
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

const InputAreaOne = function() {

  return (
    <Col span={12} style={{ padding: '0 15px',
      boxSizing: 'border-box'}}>
      <Col className='box'>
        <h4 className='text'>Name</h4>
        <Input placeholder='Name'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Actual Name</h4>
        <Input placeholder='Actual Name'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Print Name</h4>
        <Input placeholder='Print Name'/>
      </Col>
    </Col>

  );

};

const InputAreaTwo = function() {

  return (

    <Col span={12} style={{ padding: '0 15px',
      boxSizing: 'border-box'}}>
      <Col className='box'>
        <h4 className='text'>Tax Ledger</h4>
        <Input placeholder='Tax Ledger'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Sales Ledger</h4>
        <Input placeholder='Sales Ledger'/>
      </Col>
      <Col className='box'>
        <h4 className='text'>Purchase Ledger</h4>
        <Input placeholder='Purchase Ledger'/>
      </Col>
    </Col>
  );

};

const dateFormatList = [ 'DD/MM/YYYY', 'DD/MM/YY' ];


export class Tax extends Component {

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
            <h4 className='text' style={{width: 'auto'}}>Tax Rate and Effective Rate</h4>
            <Col style={{margin: '0 10px'}}>
              <h5 className='text' style={{width: 'auto'}}>Effective From</h5>
              <DatePicker defaultValue={moment('01/01/2015', dateFormatList[0])} format={dateFormatList} />

            </Col>
            <Col>
              <h5 className='text' style={{width: 'auto'}}>Tax Rate</h5>
              <InputNumber min={1} max={100000} />
            </Col>
            <Col style={{display: 'flex',
              alignItems: 'center',
              marginTop: '15px'}}>
              <Button shape='circle' icon={<MinusCircleOutlined />} style={{margin: '0 10px'}}></Button>
              <Button shape='circle' icon={<PlusCircleOutlined />}></Button>
            </Col>
          </Col>
          <Col span={24} className='box submit' style={{display: 'flex',
            justifyContent: 'center'}}>
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

export default Tax;
