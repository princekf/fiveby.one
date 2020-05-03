import React, { Component } from 'react';
import { AutoComplete, Button, Col, DatePicker, Input, InputNumber, Layout, Row, Select, Table } from 'antd';
import './Purchase.scss';
import moment from 'moment';
import { TagOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const dataSource = [
  {
    key: '1',
    name: 'Classmate Note book 100p',
    rate: 32,
    quantity: 5,
    unit: 5,
    mrp: 15,
    tax: 10,
    amount: 200,
    netAmount: 1000,
  },
  {
    key: '2',
    name: 'Classmate Note book 100p',
    rate: 32,
    quantity: 5,
    unit: 5,
    mrp: 15,
    tax: 10,
    amount: 200,
    netAmount: 1000,
  },
  {
    key: '3',
    name: 'Classmate Note book 100p',
    rate: 32,
    quantity: 5,
    unit: 5,
    mrp: 15,
    tax: 10,
    amount: 200,
    netAmount: 1000,
  },
];

const columns = [
  {
    title: 'Product name/Desc',
    dataIndex: 'name',
    key: 'name',
    width: '20%',
  },
  {
    title: 'Unit Price',
    dataIndex: 'rate',
    key: 'rate',
  },
  {
    title: 'Qty',
    dataIndex: 'quantity',
    key: 'quantity',
    render(quantity: number) {

      return (
        <div>
          <InputNumber min={1} max={100000} defaultValue={quantity} />
        </div>
      );

    },
  },
  {
    title: 'Unit',
    dataIndex: 'unit',
    key: 'unit',
  },
  {
    title: 'MRP',
    dataIndex: 'mrp',
    key: 'mrp',
    render(mrp: number) {

      return (
        <div style={{ display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center' }}>
          <span>{mrp}</span>
          <TagOutlined />
        </div>
      );

    },
  },
  {
    title: 'Tax %',
    dataIndex: 'tax',
    key: 'tax',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: 'Net Amount',
    dataIndex: 'netAmount',
    key: 'netAmount',
  },
];

const options = [
  {
    value: 'Burns Bay Road',
  },
  {
    value: 'Downing Street',
  },
  {
    value: 'Wall Street',
  },
];

const party = [
  {
    value: 'Party 1',
  },
  {
    value: 'Party 2',
  },
  {
    value: 'Party 3',
  },
];


const dateFormatList = [ 'DD/MM/YYYY', 'DD/MM/YY' ];

export class Purchase extends Component {

  public render() {

    return (
      <Layout>
        <Row className='main_div'>
          <Col span={24} style={{ display: 'flex',
            padding: '10px' }}>
            <Col span={12} style={{ display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between' }}>
              <div className='item'>
                <h4>Invoice No.</h4>
                <InputNumber min={1} max={100000} defaultValue={12035} disabled={true} />
              </div>
              <div className='item'>
                <h4>Invoice Date</h4>
                <DatePicker defaultValue={moment('01/01/2015', dateFormatList[0])} format={dateFormatList} />
              </div>
            </Col>
            <Col span={12} style={{ display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between' }}>
              <div className='item'>
                <h4>Order No.</h4>
                <InputNumber min={1} max={100000} defaultValue={458123} disabled={true} />
              </div>
              <div className='item'>
                <h4>Order Date</h4>
                <DatePicker defaultValue={moment('01/01/2015', dateFormatList[0])} format={dateFormatList} />
              </div>
            </Col>
          </Col>

          <Col span={24} style={{ display: 'flex',
            padding: '10px' }}>
            <Col span={12} style={{ display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between' }}>
              <div className='two_item'>
                <h4>Party</h4>
                <AutoComplete
                  style={{
                    width: '70%',
                  }}
                  options={party}
                  placeholder='Party code / name to search'
                  filterOption={true}
                />
              </div>
            </Col>
            <Col span={12} style={{ display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between' }}>
              <div className='two_item'>
                <h4>Tax Type</h4>
                <Select defaultValue='Direct' style={{ width: 120 }}>
                  <Option value='direct'>Direct</Option>
                  <Option value='reverse'>Reverse</Option>
                </Select>
              </div>
            </Col>
          </Col>

          <Col span={24} style={{ padding: '10px' }}>
            <div style={{ marginBottom: 16 }}>
              <AutoComplete
                style={{
                  width: '100%',
                  maxWidth: '700px',
                }}
                size='large'
                options={options}
                placeholder='Enter item code or name or scan bar code'
                filterOption={true}
              />
            </div>
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
            <Col span={24} style={{ display: 'flex',
              justifyContent: 'start',
              alignItems: 'center',
              marginTop: '15px' }}>
              <h4 style={{ marginRight: '10px' }}>Narration</h4>
              <TextArea rows={3} style={{ width: '50%' }} />
            </Col>
            <Col span={24} style={{ display: 'flex',
              justifyContent: 'space-between',
              marginTop: '15px' }}>
              <Col span={18}>
                <Col span={10} className='total_line' style={{ display: 'flex',
                  justifyContent: 'space-between' }}>
                  <Col span={8} style={{ display: 'flex',
                    justifyContent: 'space-between' }}>
                    <h4>SUB TOTAL</h4>
                    <h4>54.25</h4>
                  </Col>
                  <Col span={8} style={{ display: 'flex',
                    justifyContent: 'space-between' }}>
                    <h4>Tax</h4>
                    <h4>0.00</h4>
                  </Col>
                </Col>
                <Col span={10} className='total_line' style={{ display: 'flex',
                  justifyContent: 'space-between' }}>
                  <Col span={8} style={{ display: 'flex',
                    justifyContent: 'space-between' }}>
                    <h4>Discount</h4>
                    <h4>0.00</h4>
                  </Col>
                  <Col span={8} style={{ display: 'flex',
                    justifyContent: 'space-between' }}>
                    <h4>Round Off</h4>
                    <h4>0.00</h4>
                  </Col>
                </Col>
                <Col span={5} className='total_line' style={{ display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '10px' }}>
                  <Col span={15} style={{ display: 'flex',
                    justifyContent: 'space-between' }}>
                    <h3>Total Items</h3>
                    <h3>3</h3>
                  </Col>
                </Col>
              </Col>
              <Col span={6}>
                <Button className='pay_btn'>
                  <h1>SAVE</h1>
                  <span>Total amount</span>
                  <br />
                  <span>Rs. 51.00</span>
                </Button>
              </Col>
            </Col>
          </Col>
          {/* <Col span={8} style={{ display: "flex" }}>
            <Button style={{ margin: "auto" }} type="primary" size={"large"}>
              Save
            </Button>
          </Col> */}
        </Row>
      </Layout>
    );

  }

}

export default Purchase;
