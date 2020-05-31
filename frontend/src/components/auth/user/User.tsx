import React, { Component } from 'react';
import { Button, Col, Input, Row, Table, Form, Popconfirm, Space, message, Popover } from 'antd';
import { FormInstance } from 'antd/lib/form';
import Axios from 'axios';
import { getAuthHeaders } from '../../../session';
import { AuthUris, User, Constants } from 'fivebyone';
import generator from 'generate-password';
const { HTTP_OK } = Constants;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};


const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

interface UserT extends User {
  key: string;
}

interface UState {
  users: User[];
  selectedUser: UState;
}

export class UserComponent extends Component<UState, {}> {

  formRef = React.createRef<FormInstance>();

  state = {
    users: [],
    selectedUser: {
      _id: null,
      name: null,
    }
  }

  async componentDidMount() {

    await this.getUserData();

  }

  private generatePassword = () => {

    const generatePassword = generator.generate({
      length: 6,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: true,
      strict: true
    });

    if (this.formRef.current) {

      this.formRef.current.setFieldsValue({
        password: generatePassword
      });

    }

  }


  private inputAreaOne = () => {

    return (
      <Col span={12} style={{ padding: '0 15px',
        boxSizing: 'border-box'}}>
        <Form.Item name='name'label='Name' rules={[ {
          required: true,
          message: 'Name required'
        } ]}>
          <Input placeholder='Enter user name'/>
        </Form.Item>
        <Form.Item name='email'label='Email' rules={[ {
          required: true,
          message: 'Email required'
        } ]}>
          <Input placeholder='Enter user email'/>
        </Form.Item>
        <Popover content={
          <div style={{display:'flex', flexDirection:'column'}} >
            <p>1. Minimum 6 characters</p>
            <p>2. Minimum 1 Uppercase character</p>
            <p>3. Minimum 1 Lowercase character</p>
            <p>4. Minimum 1 Special character</p>
            <Button type='primary' style={{margin:'0 auto'}} onClick={this.generatePassword} >Generate password</Button>
          </div>} title='Password Policy' trigger='focus'>
          <Form.Item name='password'label='Password' rules={[ {
            required: true,
            message: 'Password required'
          } ]}>
            <Input.Password placeholder='Enter user password'/>
          </Form.Item>
        </Popover>
        <Form.Item name='mobile' label='Mobile'>
          <Input placeholder='Enter user mobile number'/>
        </Form.Item>
        <Form.Item name='addressLine1' label='Address line1'>
          <Input placeholder='Address line1'/>
        </Form.Item>
        <Form.Item name='addressLine2' label='Address line2'>
          <Input placeholder='Address line2'/>
        </Form.Item>
      </Col>
    );

  };

  private inputAreaTwo = () => {

    return (
      <Col span={12} style={{ padding: '0 15px',
        boxSizing: 'border-box'}}>
        <Form.Item name='addressLine3' label='Address line3'>
          <Input placeholder='Address line3'/>
        </Form.Item>
        <Form.Item name='addressLine4' label='Address line4'>
          <Input placeholder='Address line4'/>
        </Form.Item>
        <Form.Item name='state'label='State'>
          <Input placeholder='State'/>
        </Form.Item>
        <Form.Item name='country' label='Country'>
          <Input placeholder='Country'/>
        </Form.Item>
        <Form.Item name='pinCode' label='PIN Code'>
          <Input placeholder='PIN code'/>
        </Form.Item>
      </Col>
    );

  };

  private renderButtonPanel = () => {

    return (
      <Form.Item {...tailLayout} style={{ width: '100%' }}>
        <Space size='large'>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
          <Popconfirm
            title={`Are you sure delete the unit ${this.state.selectedUser.name}?`}
            okText='Yes'
            cancelText='No'
            onConfirm={this.handleUserDelete}
            disabled={!this.state.selectedUser._id}
          >
            <Button type='primary' htmlType='button'>
              Delete
            </Button>
          </Popconfirm>
          <Button type='primary' htmlType='reset' onClick={this.handleUserFormReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    );

  };

  private getUserData = async(): Promise<void> => {

    const hideLodingMessage = message.loading('Fetching user from server...');
    try {

      const response = await Axios.get<UserT[]>(AuthUris.USER_URI, { headers: getAuthHeaders() });
      const users: UserT[] = response.data;

      users.forEach((partObj) => {

        partObj.key = partObj._id;

      });

      await this.setState({ users });


    } finally {

      hideLodingMessage();

    }

  };

  private handleUserSubmit = async(values: any): Promise<void> => {

    const hideLodingMessage = message.loading('Updating user into server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      let response;

      if (values._id) {

        response = await Axios.put<User>(`${AuthUris.USER_URI}/${values._id}`, values, { headers: getAuthHeaders() });

      } else {

        response = await Axios.post<User>(AuthUris.USER_URI, values, { headers: getAuthHeaders() });

      }
      if (response.status !== HTTP_OK) {

        message.error('User update failed, please try again', ERROR_MESSAGE_DISPLAY_TIME);

      }

    } catch (error) {

      message.error('User update failed, please try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();
      await this.getUserData();

    }

  }

  private renderUserForm = () => {

    return (
      <Form {...layout} name='advanced_search' size='small' style={{ margin: 'auto',
        width: '100%'}} ref={this.formRef} onFinish={this.handleUserSubmit}>
        <Form.Item name='_id' label='Hidden ID Field.' style={{ display: 'none' }} >
          <Input placeholder='Hidden field.' />
        </Form.Item>
        <Row style={{ display: 'flex'}}>
          <Col span={24} style={{ display: 'flex'}}>
            {this.inputAreaOne()}
            {this.inputAreaTwo()}
          </Col>
          {this.renderButtonPanel()}
        </Row>
      </Form>
    );

  }


  private handleUserFormReset = (): void => {

    if (this.formRef.current) {

      this.formRef.current.resetFields();

    }

    this.setState({ selectedUser: {} });

  };

  private handleUserRowEvents = (record: any): any => {

    const { formRef } = this;
    return {
      onClick: async() => {

        const response = await Axios.get<User>(`${AuthUris.USER_URI}/${record._id}`, { headers: getAuthHeaders() });
        const user: User = response.data;
        const convertedObj = { ...user };
        this.setState({ selectedUser: convertedObj });
        if (formRef.current) {

          formRef.current.setFieldsValue(convertedObj);

        }

      }
    };

  };

  private handleUserDelete = async(): Promise<void> => {

    const selectedID = this.formRef.current?.getFieldValue('_id');
    const hideLodingMessage = message.loading('Deleting tax from server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      const response = await Axios['delete'](`${AuthUris.USER_URI}/${selectedID}`, { headers: getAuthHeaders() });
      if (response.status !== HTTP_OK) {

        message.error('User delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }
      if (this.formRef.current) {

        this.formRef.current.resetFields();
        this.setState({ selectedUser: {} });

      }
      await this.getUserData();

    } catch (err) {

      message.error('User delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }

  };

  render() {

    return (
      <>
        {this.renderUserForm()}
        <Table<User> dataSource={this.state.users} size='small' key='_id'
          pagination={false} onRow={this.handleUserRowEvents} >
          <Table.Column<User> key='name' title='Name' dataIndex='name' />
          <Table.Column<User> key='email' title='E-Mail' dataIndex='email' />
          <Table.Column<User> key='mobile' title='Mobile' dataIndex='mobile' />
        </Table>
      </>
    );

  }

}

export default UserComponent;
