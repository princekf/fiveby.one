import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { Breadcrumb, Layout } from 'antd';
import Sales from '../sales/Sales';
import Purchase from '../purchase/Purchase';
import PurchaseReturn from '../purchase/PurchaseReturn';
import SalesReturn from '../sales/SalesReturn';
import './Home.scss';

const { Content } = Layout;

export class ContentComponent extends Component {

  render() {

    return (
      <div>
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
      </div>
    );

  }

}

export default ContentComponent;
