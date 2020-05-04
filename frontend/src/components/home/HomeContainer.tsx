import React, { Component } from 'react';
import { Link, Route, BrowserRouter as Router } from 'react-router-dom';
import { Breadcrumb, Layout, Menu} from 'antd';
import { AppstoreOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import Sales from '../sales/Sales';
import Purchase from '../purchase/Purchase';
import PurchaseReturn from '../purchase/PurchaseReturn';
import SalesReturn from '../sales/SalesReturn';
import './Home.scss';

const { Header, Content, Sider } = Layout;

const SiderMenuSection = function() {

  return (
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
  );

};

class HomeContainer extends Component {

  state = {
    collapsed: false,
  };

  onCollapse = (collapsed: boolean) => {

    this.setState({ collapsed });

  };

  toggle = () => {

    this.setState({
      collapsed: !this.state.collapsed,
    });

  };

  render() {

    return (
      <Router>
        <Layout className='home-parent-layout' hasSider={true}>
          <Sider onCollapse={this.onCollapse} breakpoint='lg' collapsedWidth='0' collapsed={this.state.collapsed} collapsible={false}>
            <div className='logo' />
            <SiderMenuSection />
          </Sider>
          <Layout>
            <Header style={{ background: '#FFFFFF',
              padding: 0 }}>
              {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: 'trigger',
                onClick: this.toggle,
              })}
            </Header>
            <Content style={{ height: 'calc(100vh - 64px)',
              overflow: 'auto',
              width: '100%'}}>
              <Breadcrumb style={{ margin: '16px 24px' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>List</Breadcrumb.Item>
                <Breadcrumb.Item>App</Breadcrumb.Item>
              </Breadcrumb>
              <Content className='layout-content'>
                <Route exact={true} path='/sale' component={Sales} />
                <Route path='/purchase/return' component={PurchaseReturn} />
                <Route path='/purchase' component={Purchase} />
                <Route path='/sale/return' component={SalesReturn} />
              </Content>
            </Content>
          </Layout>
        </Layout>
      </Router>
    );

  }

}
export default HomeContainer;
