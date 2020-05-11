import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import './Home.scss';

const elements = [
  {
    name: 'Sale',
    link: '/sale'
  },
  {
    name: 'Purchase',
    link: '/purchase'
  },
  {
    name: 'PurchaseReturn',
    link: '/purchase/return'
  },
  {
    name: 'SaleReturn',
    link: '/sale/return'
  },
  {
    name: 'PriceType',
    link: '/price'
  },
  {
    name: 'Product',
    link: '/product'
  },
  {
    name: 'Unit',
    link: '/unit'
  },
  {
    name: 'StockGroup',
    link: '/stock'
  },
  {
    name: 'Tax',
    link: '/tax'
  },
  {
    name: 'Excess',
    link: '/excess'
  },
  {
    name: 'Vendor',
    link: '/vendor'
  },
];

export class SilderComponent extends Component {

  render() {

    return (
      <div>
        <Menu theme='dark' defaultSelectedKeys={[ '1' ]} mode='inline'>
          {elements.map((value, index) => {

            return (
              <Menu.Item key={index}>
                <AppstoreOutlined />
                <span>{value.name}</span>
                <Link to={value.link} />
              </Menu.Item>
            );

          })}
        </Menu>
      </div>
    );

  }

}

export default SilderComponent;
