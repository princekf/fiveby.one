import React from "react";
import axios from "axios";
import { Button, Form, Input, Checkbox } from "antd";
import { setSession } from "../../session";

import "./LoginForm.css";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export class LoginForm extends React.Component<{}, {}> {
  public render() {
    return (
      <Form
        className="login-form"
        {...layout}
        name="basic"
        initialValues={{ remember: true }}
        size="small"
        onFinish={this.handleLogin}
        // onFinishFailed={this.onFinishFailed}
      >
        <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please input your email!" }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please input your password!" }]}>
          <Input.Password />
        </Form.Item>

        <Form.Item {...tailLayout} name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }

  private handleLogin = async (values: any): Promise<void> => {
    const { email, password } = values;
    try {
      this.setState({ error: "" });
      this.setState({ isRequesting: true });
      const response = await axios.post<{ token: string; expiry: string }>("/api/users/login", { email, password });
      const { token, expiry } = response.data;
      setSession(token, expiry);
      this.setState({ isLoggedIn: true });
    } catch (error) {
      this.setState({ error: "Something went wrong" });
    } finally {
      this.setState({ isRequesting: false });
    }
  };
}

export default LoginForm;
