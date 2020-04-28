import React, { Component } from "react";
import { Button, Table, Layout, Row, Col, AutoComplete } from "antd";
// import { SettingOutlined } from "@ant-design/icons";
// import "./Sales.css";
// import { string } from "prop-types";

const { Header } = Layout;

const dataSource = [
  {
    key: "1",
    name: "Classmate Note book 100p",
    rate: 32,
    quantity: 5,
    tax: 10,
    total: 200,
  },
  {
    key: "2",
    name: "Classmate Note book 100p",
    rate: 32,
    quantity: 5,
    tax: 10,
    total: 200,
  },
  {
    key: "3",
    name: "Classmate Note book 100p",
    rate: 32,
    quantity: 5,
    tax: 10,
    total: 200,
  },
];

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Rate",
    dataIndex: "rate",
    key: "rate",
  },
  {
    title: "Qty",
    dataIndex: "quantity",
    key: "quantity",
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

export class purchase extends Component {
  public render() {
    return (
      <Layout>
        <Header>Header</Header>
        <Row className="main_div">
          <Col span={24} style={{ padding: "10px" }}>
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
                <button className="pay_btn">
                  <h1>PAY</h1>
                  <span>Total amount</span>
                  <br />
                  <span>Rs. 51.00</span>
                </button>
              </div>
            </div>
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

export default purchase;
