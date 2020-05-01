import React from "react";
import { Modal } from "antd";

import { isSessionValid } from "../../session";
import "./LoginForm.scss";
import LoginForm from "./LoginForm";

export class LoginPage extends React.Component<{}, {}> {
  public componentDidMount() {
    if (isSessionValid()) {
      Modal.destroyAll();
      window.location.href = "/";
    }
  }

  public render() {
    return (
      <Modal title="Please login to continue..." visible={true} closable={false} destroyOnClose={true} footer={null}>
        <LoginForm authSuccessHandler={this.handleAuthScess.bind(this)} />
      </Modal>
    );
  }

  private handleAuthScess = (): void => {
    Modal.destroyAll();
    window.location.href = "/";
  };
}

export default LoginPage;
