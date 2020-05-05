import React from 'react';
import axios from 'axios';
import { AutoComplete, Button, Col, Input, Layout, Row, Table, DatePicker } from 'antd';
import './Sales.scss';
import { SelectProps } from 'antd/lib/select';
import { getAuthHeaders } from '../../session';
import moment from 'moment';

const columns = [
  {
    title: 'Product Name/Desc',
    dataIndex: 'name',
    width: '50%',
  },
  {
    title: 'Unit Price',
    dataIndex: 'price',
    align: 'right' as 'right',
  },
  {
    title: 'Qty',
    dataIndex: 'quantity',
    align: 'right' as 'right',
  },
  {
    title: 'Discount',
    dataIndex: 'discount',
    align: 'right' as 'right',
  },
  {
    title: 'Tax %',
    dataIndex: 'tax',
    align: 'right' as 'right',
  },
  {
    title: 'Total',
    dataIndex: 'total',
    align: 'right' as 'right',
  },
];

const dateFormatList = [ 'DD/MM/YYYY', 'DD/MM/YY' ];

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

const SummaryArea = function() {

  return (
    <div className='last_cont'>
      <div className='total_cont'>
        <div className='subtotal'>
          <h3 className='total_heading'>SUB TOTAL </h3>
          <h3 className='total_heading'>51.00</h3>
        </div>
        <div className='disc'>
          <h3 className='total_heading'>Discount </h3>
          <h3 className='total_heading'>0.00</h3>
        </div>
        <div className='tax'>
          <h3 className='total_heading'>Tax </h3>
          <h3 className='total_heading'> 0.00</h3>
        </div>
        <div className='total_item'>
          <h3 className='total_heading'>Total item</h3>
          <h3 className='total_heading'>1.00</h3>
        </div>
      </div>
      <div className='button'>
        <Button className='pay_btn' type='primary' size={'large'}>
          <h1>PAY</h1>
          <span>Total amount</span>
          <br />
          <span>Rs. 51.00</span>
        </Button>
      </div>
    </div>
  );

};

const PartyDetails = function() {

  return (
    <Col span={24} style={{ display: 'flex',
      padding: '10px' }}>
      <Col span={16} style={{ display: 'flex',
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
      <Col span={8} style={{ display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between' }}>
        <div className='two_item'>
          <h4>Date</h4>
          <DatePicker defaultValue={moment('01/01/2015', dateFormatList[0])} format={dateFormatList} />

        </div>
      </Col>
    </Col>
  );

};

const SavedSalesArea = function() {

  return (
    <Col span={6}>
      <Row style={{ display: 'flex',
        marginBottom: '20px',
        justifyContent: 'space-around' }}>
        <Button className='card' style={{ height: '90px',
          width: '150px',
          marginBottom: '10px' }} size={'large'}>
          <h2 style={{ marginBottom: '0px' }}>Save</h2>
        </Button>
        <Button className='card' style={{ height: '90px',
          width: '150px',
          marginBottom: '10px',
          border: 'none' }}>
          <h3>Customer 1</h3>
          <h5>Qty: 5</h5>
          <h5>Price: 5</h5>
          <h5>Date: 20/2/2020</h5>
        </Button>
        <Button className='card' style={{ height: '90px',
          width: '150px',
          marginBottom: '10px',
          border: 'none' }}>
          <h3>Customer 2</h3>
          <h5>Qty: 5</h5>
          <h5>Price: 5</h5>
          <h5>Date: 20/2/2020</h5>
        </Button>
        <Button className='card' style={{ height: '90px',
          width: '150px',
          marginBottom: '10px',
          border: 'none' }}>
          <h3>Customer 3</h3>
          <h5>Qty: 5</h5>
          <h5>Price: 5</h5>
          <h5>Date: 20/2/2020</h5>
        </Button>
      </Row>
    </Col>
  );

};

interface SaleState {
  options: SelectProps<object>['options'];
  selectedProductId: string;
  seleProducts: App.ProductSale[];
}

export class Sales extends React.Component<{}, SaleState> {

  state = {
    options: [],
    selectedProductId: '',
    seleProducts: Array<App.ProductSale>(0),
  };

  products: App.Product[] = [];

  private handleSearch = (value: string) => {

    this.setState({ options: value ? this.searchResult(value) : [] });

  };

  private onProductTyping = (value: string) => {

    this.setState({ selectedProductId: value });

  };

  private onProductSelect = (value: string) => {

    const existingP: App.ProductSale = this.state.seleProducts.find((saleP) => {

      return saleP.productId === value;

    })!;

    if (existingP) {

      const quantity: number = existingP.quantity + 1;
      existingP.quantity = quantity;
      existingP.total = existingP.price * quantity;
      this.setState({ seleProducts: [ ...this.state.seleProducts ] });

    } else {

      const selectedProduct: App.Product = this.products.find((product) => {

        return product._id === value;

      })!;
      const productSale: App.ProductSale = {
        ...selectedProduct,
        _id: '',
        name: selectedProduct?.name,
        barcode: selectedProduct?.barcode,
        productId: selectedProduct?._id,
        price: selectedProduct?.price,
        quantity: 1,
        discount: 0,
        tax: 0,
        total: selectedProduct?.price,
      };
      this.setState({ seleProducts: [ ...this.state.seleProducts, productSale ] });

    }
    this.setState({ selectedProductId: '' });

  };

  private searchResult = (query: string) => {

    const queryL: string = query.toLowerCase();
    return this.products
      .filter((product) => {

        const isName = product.name.toLowerCase().includes(queryL);
        const isBarcode = product.barcode.toLowerCase().startsWith(queryL);
        return isName || isBarcode;

      })
      .map((productF) => {

        return {
          value: productF._id,
          label:
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{productF.name}</span>
              <span>{productF.barcode}</span>
              <span>{productF.price}</span>
            </div>
          ,
        };

      });

  };


  public async componentDidMount() {

    const response = await axios.get<App.Product[]>('/api/products', { headers: getAuthHeaders() });
    this.products = response.data;

  }


  public render() {

    return (
      <Layout>
        <Row className='main_div'>
          <Col span={18} style={{ padding: '10px' }}>
            <div style={{ marginBottom: 16 }}>
              <AutoComplete
                style={{
                  width: '100%',
                }}
                defaultActiveFirstOption={true}
                options={this.state.options}
                onChange={this.onProductTyping}
                onSelect={this.onProductSelect}
                onSearch={this.handleSearch}
                value={this.state.selectedProductId}
              >
                <Input.Search size='large' placeholder='Enter item code or name or scan bar code' enterButton={true} />
              </AutoComplete>
              <PartyDetails/>
            </div>
            <Table
              dataSource={this.state.seleProducts}
              columns={columns}
              scroll={{ y: 240 }}
              rowKey='productId'
              size='small'
              pagination={false}
              style={{ height: '50vh' }}
            />
            <SummaryArea />
          </Col>
          <SavedSalesArea />
        </Row>
      </Layout>
    );

  }

}

export default Sales;
