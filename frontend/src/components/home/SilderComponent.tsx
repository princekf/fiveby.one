import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { AppstoreOutlined, UserOutlined, VideoCameraOutlined, VerifiedOutlined, SnippetsOutlined, AuditOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import './Home.scss';

const Sale = function() {

  return (
    <div>
      <UserOutlined />
      <span>Sale</span>
    </div>
  );

};

const Purchase = function() {

  return (
    <div>
      <VideoCameraOutlined />
      <span>Purchase</span>
    </div>
  );

};

const PurchaseReturn = function() {

  return (
    <div>
      <AppstoreOutlined />
      <span>Purchase Return</span>
    </div>
  );

};

const SaleReturn = function() {

  return (
    <div>
      <VerifiedOutlined />
      <span>Sale Return</span>
    </div>
  );

};

const PriceType = function() {

  return (
    <div>
      <MoneyCollectOutlined />
      <span>Price Type</span>
    </div>
  );

};

const Product = function() {

  return (
    <div>
      <SnippetsOutlined />
      <span>Product</span>
    </div>
  );

};

const StockGroup = function() {

  return (
    <div>
      <AuditOutlined />
      <span>Stock Group</span>
    </div>
  );

};

const Unit = function() {

  return (
    <div>
      <AuditOutlined />
      <span>Unit</span>
    </div>
  );

};

const Tax = function() {

  return (
    <div>
      <AuditOutlined />
      <span>Tax</span>
    </div>
  );

};

const Excess = function() {

  return (
    <div>
      <AuditOutlined />
      <span>Excess</span>
    </div>
  );

};

// Const Vendor = function() {

/*
 *   Return (
 *     <div>
 *       <AuditOutlined />
 *       <span>Vendor</span>
 *     </div>
 *   );
 */

// };


export class SilderComponent extends Component {

  render() {

    return (
      <div>
        <Menu theme='dark' defaultSelectedKeys={[ '1' ]} mode='inline'>
          <Menu.Item key='1'>
            <Sale/>
            <Link to='/sale' />
          </Menu.Item>
          <Menu.Item key='2'>
            <Purchase/>
            <Link to='/purchase' />
          </Menu.Item>
          <Menu.Item key='3'>
            <PurchaseReturn/>
            <Link to='/purchase/return' />
          </Menu.Item>
          <Menu.Item key='4'>
            <SaleReturn/>
            <Link to='/sale/return' />
          </Menu.Item>
          <Menu.Item key='5'>
            <PriceType/>
            <Link to='/price' />
          </Menu.Item>
          <Menu.Item key='6'>
            <Product/>
            <Link to='/product' />
          </Menu.Item>
          <Menu.Item key='7'>
            <StockGroup/>
            <Link to='/stock' />
          </Menu.Item>
          <Menu.Item key='8'>
            <Unit/>
            <Link to='/unit' />
          </Menu.Item>
          <Menu.Item key='9'>
            <Tax/>
            <Link to='/tax' />
          </Menu.Item>
          <Menu.Item key='10'>
            <Excess/>
            <Link to='/excess' />
          </Menu.Item>
          {/* <Menu.Item key='11'>
            <Vendor/>
            <Link to='/vendor' />
          </Menu.Item> */}
        </Menu>
      </div>
    );

  }

}

export default SilderComponent;
