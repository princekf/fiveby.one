import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import { UserOutlined, VideoCameraOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
function Dashboard() {
  return <div>Dashboard</div>;
}
function Meseros() {
  return <div>Meseros</div>;
}

const { Header, Content, Footer, Sider } = Layout;

class TestComponent extends Component {
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
        <Layout style={{ minHeight: "100vh" }}>
          <Sider collapsible={true} collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
            <div className="logo" />
            <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
              <Menu.Item key="1">
                <UserOutlined />
                <span>Deshboard</span>
                <Link to="/" />
              </Menu.Item>
              <Menu.Item key="2">
                <VideoCameraOutlined />
                <span>Meseros</span>
                <Link to="/meseros" />
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Header style={{ background: "#fff", padding: 0, paddingLeft: 16 }}>
              <MenuUnfoldOutlined
                className="trigger"
                type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
                style={{ cursor: "pointer" }}
                onClick={this.toggle}
              />
            </Header>
            <Content
              style={{
                margin: "24px 16px",
                padding: 24,
                background: "#fff",
                minHeight: 280,
              }}
            >
              <Route exact={true} path="/" component={Dashboard} />
              <Route path="/meseros" component={Meseros} />
            </Content>
            <Footer style={{ textAlign: "center" }}>Ant Design ©2016 Created by Ant UED</Footer>
          </Layout>
        </Layout>
      </Router>
    );
  }
}
export default TestComponent;
