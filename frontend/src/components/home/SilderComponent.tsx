import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { AppstoreOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import './Home.scss';

export class SilderComponent extends Component {

  render() {
    return (
      <div>
        <Menu theme='dark' defaultSelectedKeys={[ '1' ]} mode='inline'>
          <Menu.Item key='1'>
            <UserOutlined />
            <span>Sale</span>
            <Link to='/sale' />
          </Menu.Item>
          <Menu.Item key='2'>
            <VideoCameraOutlined />
            <span>Purchase</span>
            <Link to='/purchase' />
          </Menu.Item>
          <Menu.Item key='3'>
            <AppstoreOutlined />
            <span>Purchase Return</span>
            <Link to='/purchase/return' />
          </Menu.Item>
          <Menu.Item key='4'>
            <AppstoreOutlined />
            <span>Sale Return</span>
            <Link to='/sale/return' />
          </Menu.Item>
        </Menu>
      </div>
    )
  }
}

export default SilderComponent
