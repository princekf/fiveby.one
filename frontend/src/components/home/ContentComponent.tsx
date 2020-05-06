import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { Breadcrumb, Layout } from 'antd';
import Sales from '../inventory/sales/Sales';
import Purchase from '../inventory/purchase/Purchase';
import PurchaseReturn from '../inventory/purchase/PurchaseReturn';
import SalesReturn from '../inventory/sales/SalesReturn';
import './Home.scss';
import PriceType from '../inventory/master/PriceType';
import StockGroup from '../inventory/master/StockGroup';
import Product from '../inventory/master/Product';

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
            <Route path='/price' component={PriceType} />
            <Route path='/stock' component={StockGroup} />
            <Route path='/product' component={Product} />
          </Content>
        </Content>
      </div>
    );

  }

}

export default ContentComponent;