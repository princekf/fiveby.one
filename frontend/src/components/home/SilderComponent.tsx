import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { AppstoreOutlined, MailOutlined } from '@ant-design/icons';
import './Home.scss';

const { SubMenu } = Menu;

const inventory = [
  {
    key: 1,
    name: 'Sale',
    link: '/sale'
  },
  {
    key: 2,
    name: 'Purchase',
    link: '/purchase'
  },
  {
    key: 3,
    name: 'PurchaseReturn',
    link: '/purchase/return'
  },
  {
    key: 4,
    name: 'SaleReturn',
    link: '/sale/return'
  },
  {
    key: 5,
    name: 'PriceType',
    link: '/price'
  },
  {
    key: 6,
    name: 'Product',
    link: '/product'
  },
  {
    key: 7,
    name: 'StockGroup',
    link: '/stock'
  },
  {
    key: 8,
    name: 'Tax',
    link: '/tax'
  },
  {
    key: 9,
    name: 'Excess',
    link: '/excess'
  },
  {
    key: 10,
    name: 'Vendor',
    link: '/vendor'
  },
];

const finance = [
  {
    key: 11,
    name: 'Cost Center',
    link: '/cost'
  },
  {
    key: 12,
    name: 'Ledger',
    link: '/ledger'
  },
  {
    key: 13,
    name: 'Ledger Group',
    link: '/ledgergroup'
  },
  {
    key: 14,
    name: 'Ledger Property',
    link: '/ledgerproperty'
  }
];

export class SilderComponent extends Component {

  render() {

    return (
      <div>
        <Menu theme='dark' defaultSelectedKeys={[ '0' ]} mode='inline' >
          <SubMenu key='sub1' icon={<MailOutlined />} title='Inventory'>
            {inventory.map((value) => {

              return (
                <Menu.Item key={value.key}>
                  <AppstoreOutlined />
                  <span>{value.name}</span>
                  <Link to={value.link} />
                </Menu.Item>
              );

            })}
          </SubMenu>
          <SubMenu key='sub2' icon={<MailOutlined />} title='Finance'>
            {finance.map((value) => {

              return (
                <Menu.Item key={value.key}>
                  <AppstoreOutlined />
                  <span>{value.name}</span>
                  <Link to={value.link} />
                </Menu.Item>
              );

            })}
          </SubMenu>
        </Menu>
      </div>
    );

  }

}

export default SilderComponent;
