import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Layout, Menu, Breadcrumb } from "antd";
import { UserOutlined, VideoCameraOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import Sales from "../sales/sales-create/Sales";
import Purchase from "../purchase/Purchase";
import "./Home.scss";

const { Header, Content, Sider } = Layout;

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
        <Layout className="home-parent-layout" hasSider={true}>
          <Sider onCollapse={this.onCollapse} breakpoint="lg" collapsedWidth="0" collapsed={this.state.collapsed} collapsible={false}>
            <div className="logo" />
            <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
              <Menu.Item key="1">
                <UserOutlined />
                <span>Sale</span>
                <Link to="/sale" />
              </Menu.Item>
              <Menu.Item key="2">
                <VideoCameraOutlined />
                <span>Purcahse</span>
                <Link to="/purcahse" />
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Header style={{ background: "#FFFFFF", padding: 0 }}>
              {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: "trigger",
                onClick: this.toggle,
              })}
            </Header>
            <Breadcrumb style={{ margin: "16px 24px" }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb>
            <Content className="layout-content">
              <Route exact path="/sale" component={Sales} />
              <Route path="/purcahse" component={Purchase} />
            </Content>
          </Layout>
        </Layout>
      </Router>
    );
  }
}
export default HomeContainer;
