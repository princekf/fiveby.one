import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { AppstoreOutlined, MailOutlined } from '@ant-design/icons';
import './Home.scss';

const { SubMenu } = Menu;

const authentication = [
  {
    key: 111,
    name: 'User',
    link: '/user'
  },
  {
    key: 112,
    name: 'Company',
    link: '/company'
  },
  {
    key: 113,
    name: 'Company Branch',
    link: '/companyBranch'
  },

  /*
   * {
   *   key: 15,
   *   name: 'Ledger Property',
   *   link: '/ledgerproperty'
   * }
   */
];

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
  {
    key: 11,
    name: 'Unit',
    link: '/unit'
  },
];

const finance = [
  {
    key: 12,
    name: 'Cost Center',
    link: '/cost'
  },
  {
    key: 13,
    name: 'Ledger',
    link: '/ledger'
  },
  {
    key: 14,
    name: 'Ledger Group',
    link: '/ledgergroup'
  },
  {
    key: 15,
    name: 'Ledger Property',
    link: '/ledgerproperty'
  }
];

export class SilderComponent extends Component {

  rootSubmenuKeys = [ 'sub1', 'sub2' ];

  state = {
    openKeys: [ 'sub1' ],
  };

  onOpenChange = (openKeys: any) => {

    const latestOpenKey = openKeys.find((key: any) => {

      return this.state.openKeys.indexOf(key) === -1;

    });
    if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {

      this.setState({ openKeys });

    } else {

      this.setState({
        openKeys: latestOpenKey ? [ latestOpenKey ] : [],
      });

    }

  };

  render() {

    return (
      <div>
        <Menu theme='dark' defaultSelectedKeys={[ '0' ]} mode='inline' openKeys={this.state.openKeys}
          onOpenChange={this.onOpenChange} >
          <SubMenu key='sub1' icon={<MailOutlined />} title='Authentication'>
            {authentication.map((value) => {

              return (
                <Menu.Item key={value.key}>
                  <AppstoreOutlined />
                  <span>{value.name}</span>
                  <Link to={value.link} />
                </Menu.Item>
              );

            })}
          </SubMenu>
          <SubMenu key='sub2' icon={<MailOutlined />} title='Inventory'>
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
          <SubMenu key='sub3' icon={<MailOutlined />} title='Finance'>
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
