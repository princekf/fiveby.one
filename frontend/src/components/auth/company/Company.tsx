import React, { Component } from 'react';
import { Button, Col, Input, Row, Table, Form, Popconfirm, Space, message } from 'antd';
import { FormInstance } from 'antd/lib/form';
import Axios from 'axios';
import { getAuthHeaders } from '../../../session';
import { AuthUris, Constants, Company } from 'fivebyone';
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

interface CompanyT extends Company {
  key: string;
}

interface CState {
  companies: Company[];
  selectedCompany: CState;
}

export class CompanyComponent extends Component<CState, {}> {

  formRef = React.createRef<FormInstance>();

  state = {
    companies: [],
    selectedCompany: {
      _id: null,
      name: null,
    }
  }

  async componentDidMount() {

    await this.getCompanyData();

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
        <Form.Item name='contact' label='Contact'>
          <Input placeholder='Enter user contact number'/>
        </Form.Item>
        <Form.Item name='phone' label='Phone'>
          <Input placeholder='Enter user phone number'/>
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
        <Form.Item name='pincode' label='PIN Code'>
          <Input placeholder='PIN code'/>
        </Form.Item>
      </Col>
    );

  };

  private getCompanyData = async(): Promise<void> => {

    const hideLodingMessage = message.loading('Fetching company from server...');
    try {

      const response = await Axios.get<CompanyT[]>(AuthUris.COMPANY_URI, { headers: getAuthHeaders() });
      const companies: CompanyT[] = response.data;

      companies.forEach((partObj) => {

        partObj.key = partObj._id;

      });

      await this.setState({ companies });


    } finally {

      hideLodingMessage();

    }

  };

  private handleCompanyDelete = async(): Promise<void> => {

    const selectedID = this.formRef.current?.getFieldValue('_id');
    const hideLodingMessage = message.loading('Deleting company from server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      const response = await Axios['delete'](`${AuthUris.COMPANY_URI}/${selectedID}`, { headers: getAuthHeaders() });
      if (response.status !== HTTP_OK) {

        message.error('Company delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }
      if (this.formRef.current) {

        this.formRef.current.resetFields();
        this.setState({ selectedCompany: {} });

      }
      await this.getCompanyData();

    } catch (err) {

      message.error('Company delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }

  }

  private handleCompanyFormReset = (): void => {

    if (this.formRef.current) {

      this.formRef.current.resetFields();

    }

    this.setState({ selectedCompany: {} });

  }

  private handleCompanySubmit = async(values: any): Promise<void> => {

    const hideLodingMessage = message.loading('Updating company into server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      let response;
      if (values._id) {

        response = await Axios.put<Company>(`${AuthUris.COMPANY_URI}/${values._id}`, values, { headers: getAuthHeaders() });

      } else {

        response = await Axios.post<Company>(AuthUris.COMPANY_URI, values, { headers: getAuthHeaders() });

      }
      if (response.status !== HTTP_OK) {

        message.error('Company update failed, please try again', ERROR_MESSAGE_DISPLAY_TIME);

      }

    } catch (error) {

      message.error('Company update failed, please try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();
      await this.getCompanyData();

    }

  }

  private handleCompanyRowEvents = (record: any): any => {

    const { formRef } = this;
    return {
      onClick: async() => {

        const response = await Axios.get<Company>(`${AuthUris.COMPANY_URI}/${record._id}`, { headers: getAuthHeaders() });
        const company: Company = response.data;
        const convertedObj = { ...company };
        this.setState({ selectedCompany: convertedObj });
        if (formRef.current) {

          formRef.current.setFieldsValue(convertedObj);

        }

      }
    };

  };

  private renderButtonPanel = () => {

    return (
      <Form.Item {...tailLayout} style={{ width: '100%' }}>
        <Space size='large'>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
          <Popconfirm
            title={`Are you sure delete the company ${this.state.selectedCompany.name}?`}
            okText='Yes'
            cancelText='No'
            onConfirm={this.handleCompanyDelete}
            disabled={!this.state.selectedCompany._id}
          >
            <Button type='primary' htmlType='button' disabled={!this.state.selectedCompany._id}>
              Delete
            </Button>
          </Popconfirm>
          <Button type='primary' htmlType='reset' onClick={this.handleCompanyFormReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    );

  };

  private renderCompanyForm = () => {

    return (
      <Form {...layout} name='advanced_search' size='small' style={{ margin: 'auto',
        width: '100%'}} ref={this.formRef} onFinish={this.handleCompanySubmit}>
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

  render() {

    return (
      <>
        {this.renderCompanyForm()}
        <Table<Company> dataSource={this.state.companies} size='small' key='_id'
          pagination={false} onRow={this.handleCompanyRowEvents} >
          <Table.Column<Company> key='name' title='Name' dataIndex='name' />
          <Table.Column<Company> key='email' title='E-Mail' dataIndex='email' />
          <Table.Column<Company> key='contact' title='Contact' dataIndex='contact' />
        </Table>
      </>
    );

  }

}

export default CompanyComponent;
