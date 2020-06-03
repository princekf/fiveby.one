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
import Unit from '../inventory/master/Unit';
import Tax from '../inventory/master/Tax';
import ExcessShortDamage from '../inventory/master/ExcessShortDamage';
import Vendor from '../inventory/master/Vendor';
import CostCenter from '../finance/CostCenter';
import Ledger from '../finance/Ledger';
import LedgerGroup from '../finance/LedgerGroup';
import LedgerProperty from '../finance/LedgerProperty';
import UserComponent from '../auth/user/User';
import CompanyComponent from '../auth/company/Company';
import CompanyBranchComponent from '../auth/companyBranch/CompanyBranch';

const { Content } = Layout;

export class ContentComponent extends Component {

  render() {

    return (
      <div>
        <Content style={{ height: 'calc(100vh - 64px)',
          overflow: 'auto',
          width: '100%',
          padding: '0 20px',
          boxSizing: 'border-box'}}>
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
            <Route path='/unit' component={Unit} />
            <Route path='/tax' component={Tax} />
            <Route path='/excess' component={ExcessShortDamage} />
            <Route path='/vendor' component={Vendor} />
            <Route path='/cost' component={CostCenter} />
            <Route path='/ledger' component={Ledger} />
            <Route path='/ledgergroup' component={LedgerGroup} />
            <Route path='/ledgerproperty' component={LedgerProperty} />
            <Route path='/user' component={UserComponent} />
            <Route path='/company' component={CompanyComponent} />
            <Route path='/companyBranch' component={CompanyBranchComponent} />
          </Content>
        </Content>
      </div>
    );

  }

}

export default ContentComponent;
