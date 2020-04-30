import React from "react";
import { Button, Table, Layout, Row, Col, AutoComplete } from "antd";
import "./Sales.scss";

const { Header } = Layout;

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
          <Col span={18} style={{ padding: "10px" }}>
            <div style={{ marginBottom: 16 }}>
              {/* <Input className="search_input" addonAfter={<SettingOutlined />} defaultValue="mysite" /> */}
              <AutoComplete
                style={{
                  width: "100%",
                }}
                options={options}
                placeholder="Enter item code or name or scan bar code"
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
            <div className="last_cont">
              <div className="total_cont">
                <div className="subtotal">
                  <h3 className="total_heading">SUB TOTAL </h3>
                  <h3 className="total_heading">51.00</h3>
                </div>
                <div className="disc">
                  <h3 className="total_heading">Discount </h3>
                  <h3 className="total_heading">0.00</h3>
                </div>
                <div className="tax">
                  <h3 className="total_heading">Tax </h3>
                  <h3 className="total_heading"> 0.00</h3>
                </div>
                <div className="total_item">
                  <h3 className="total_heading">Total item</h3>
                  <h3 className="total_heading">1.00</h3>
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
          <Col span={6}>
            <Row style={{ display: "flex", marginBottom: "20px", justifyContent: "space-around" }}>
              <Button className="card" style={{ height: "90px", width: "150px", marginBottom: "10px" }} size={"large"}>
                <h2 style={{ marginBottom: "0px" }}>Save</h2>
              </Button>
              <Button className="card" style={{ height: "90px", width: "150px", marginBottom: "10px", border: "none" }}>
                <h3>Customer 1</h3>
                <h5>Qty: 5</h5>
                <h5>Price: 5</h5>
                <h5>Date: 20/2/2020</h5>
              </Button>
              <Button className="card" style={{ height: "90px", width: "150px", marginBottom: "10px", border: "none" }}>
                <h3>Customer 2</h3>
                <h5>Qty: 5</h5>
                <h5>Price: 5</h5>
                <h5>Date: 20/2/2020</h5>
              </Button>
              <Button className="card" style={{ height: "90px", width: "150px", marginBottom: "10px", border: "none" }}>
                <h3>Customer 3</h3>
                <h5>Qty: 5</h5>
                <h5>Price: 5</h5>
                <h5>Date: 20/2/2020</h5>
              </Button>
            </Row>
          </Col>
        </Row>
      </Layout>
    );
  }
}

export default Sales;
