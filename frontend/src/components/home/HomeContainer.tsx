import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import './Home.scss';
import SilderComponent from './SilderComponent';
import ContentComponent from './ContentComponent';

const { Header, Sider } = Layout;

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
          <Sider onCollapse={this.onCollapse} breakpoint='lg' collapsedWidth='0' collapsed={this.state.collapsed} collapsible={false} className='menu'>
            <div className='logo' />
            <SilderComponent />
          </Sider>
          <Layout>
            <Header style={{ background: '#FFFFFF',
              padding: 0 }}>
              {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: 'trigger',
                onClick: this.toggle,
              })}
            </Header>
            <ContentComponent/>
          </Layout>
        </Layout>
      </Router>
    );

  }

}
export default HomeContainer;
