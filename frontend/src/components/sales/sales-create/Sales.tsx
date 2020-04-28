import React, { useState } from "react";
import { Button, Form, Input, Checkbox, Spin, message, Table, Layout, Row, Col, AutoComplete, Card } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import "./Sales.css";
import { string } from "prop-types";

const { Header, Footer, Sider, Content } = Layout;

const dataSource = [
  {
    key: "1",
    name: "Classmate Note book 100p",
    unit_price: 32,
    quantity: 5,
    discount: 50,
    tax: 10,
    total: 200,
  },
  {
    key: "2",
    name: "Classmate Note book 100p",
    unit_price: 32,
    quantity: 5,
    discount: 50,
    tax: 10,
    total: 200,
  },
  {
    key: "3",
    name: "Classmate Note book 100p",
    unit_price: 32,
    quantity: 5,
    discount: 50,
    tax: 10,
    total: 200,
  },
];

const columns = [
  {
    title: "Product Name/Desc",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Unit Price",
    dataIndex: "unit_price",
    key: "unit_price",
  },
  {
    title: "Qty",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "Discount",
    dataIndex: "discount",
    key: "discount",
  },
  {
    title: "Tax %",
    dataIndex: "tax",
    key: "tax",
  },
  {
    title: "Total",
    dataIndex: "total",
    key: "total",
  },
];

const options = [
  {
    value: "Burns Bay Road",
  },
  {
    value: "Downing Street",
  },
  {
    value: "Wall Street",
  },
];

export class Sales extends React.Component {
  public render() {
    return (
      <Layout>
        <Header>Header</Header>
        <Row className="main_div">
          <Col span={16} style={{ padding: "10px" }}>
            <div style={{ marginBottom: 16 }}>
              {/* <Input className="search_input" addonAfter={<SettingOutlined />} defaultValue="mysite" /> */}
              <AutoComplete
                style={{
                  width: "100%",
                }}
                options={options}
                placeholder="Enter item code or name or scan bar code"
                // filterOption={(inputValue, option) =>
                //   option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                // }
              />
            </div>
            <Table dataSource={dataSource} columns={columns} />
            <div className="last_cont">
              <div className="total_cont">
                <div className="subtotal">
                  <h1 className="total_heading">SUB TOTAL </h1>
                  <h1 className="total_heading">51.00</h1>
                </div>
                <div className="disc">
                  <h1 className="total_heading">Discount </h1>
                  <h1 className="total_heading">0.00</h1>
                </div>
                <div className="tax">
                  <h1 className="total_heading">Tax </h1>
                  <h1 className="total_heading"> 0.00</h1>
                </div>
                <div className="total_item">
                  <h1 className="total_heading">Total item</h1>
                  <h1 className="total_heading">1.00</h1>
                </div>
              </div>
              <div className="button">
                <Button className="pay_btn" type="primary" size={"large"}>
                  <h1>PAY</h1>
                  <span>Total amount</span>
                  <br />
                  <span>Rs. 51.00</span>
                </Button>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <Row style={{ display: "flex", marginBottom: "20px" }}>
              <Button style={{ margin: "auto" }} type="primary" size={"large"}>
                Save
              </Button>
            </Row>
            <Row>
              <Card className="card" bodyStyle={{ padding: "10px" }}>
                <h1>Customer 1</h1>
              </Card>
              <Card className="card" bodyStyle={{ padding: "10px" }}>
                <h1>Customer 2</h1>
              </Card>
              <Card className="card" bodyStyle={{ padding: "10px" }}>
                <h1>Customer 3</h1>
              </Card>
              <Card className="card" bodyStyle={{ padding: "10px" }}>
                <h1>Customer 3</h1>
              </Card>
            </Row>
          </Col>
        </Row>
      </Layout>
    );
  }
}

export default Sales;
