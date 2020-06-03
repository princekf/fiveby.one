import React, { Component } from 'react';
import { Button, Col, Input, Row, Table, Form, Popconfirm, Space, Select, message, DatePicker } from 'antd';
import { FormInstance } from 'antd/lib/form';
import Axios from 'axios';
import { getAuthHeaders } from '../../../session';
import { AuthUris, Constants, CompanyBranch, Company } from 'fivebyone';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
const { HTTP_OK } = Constants;
const { Option } = Select;
const { RangePicker } = DatePicker;

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

interface CompanyBranchT extends CompanyBranch {
  key: string;
}

interface CompanyT extends Company {
  key: string;
}

interface CState {
  companyBranches: CompanyBranch[];
  selectedCompanyBranch: CState;
}

export class CompanyBranchComponent extends Component<CState, {}> {

  formRef = React.createRef<FormInstance>();

  state = {
    companyBranches: [],
    selectedCompanyBranch: {
      _id: null,
      name: null,
    },
    companies: new Array<Company>(0)
  }

  async componentDidMount() {

    await this.getCompanyBranchData();

    try {

      const response = await Axios.get<CompanyT[]>(AuthUris.COMPANY_URI, { headers: getAuthHeaders() });
      const companies: CompanyT[] = response.data;

      companies.forEach((partObj) => {

        partObj.key = partObj._id;

      });

      await this.setState({ companies });


    } finally {

      return;

    }


  }

  private companyBranchFormOne = () => {

    return (
      <Col span={12} style={{ padding: '0 15px',
        boxSizing: 'border-box'}}>
        <Form.Item
          name='company'
          label='Company'>
          <Select showSearch={true} allowClear={true}
            filterOption={(input, option) => {

              return option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

            }}
          >
            {this.state.companies.map((company) => {

              return <Option key={company._id} value={company._id}>{company.name}</Option>;

            }
            )}
          </Select>
        </Form.Item>
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

  private companyBranchFormTwo = () => {

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

  private getCompanyBranchData = async(): Promise<void> => {

    const hideLodingMessage = message.loading('Fetching company branch from server...');
    try {

      const response = await Axios.get<CompanyBranchT[]>(AuthUris.COMPANY_BRANCH_URI, { headers: getAuthHeaders() });
      const companyBranches: CompanyBranchT[] = response.data;

      companyBranches.forEach((partObj) => {

        partObj.key = partObj._id;

      });

      await this.setState({ companyBranches });


    } finally {

      hideLodingMessage();

    }

  };

  private handleCompanyBranchDelete = async(): Promise<void> => {

    const selectedID = this.formRef.current?.getFieldValue('_id');
    const hideLodingMessage = message.loading('Deleting company branch from server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      const response = await Axios['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${selectedID}`, { headers: getAuthHeaders() });
      if (response.status !== HTTP_OK) {

        message.error('Company branch delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }
      if (this.formRef.current) {

        this.formRef.current.resetFields();
        this.setState({ selectedCompany: {} });

      }
      await this.getCompanyBranchData();

    } catch (err) {

      message.error('Company branch delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }

  }

  private handleCompanyBranchFormReset = (): void => {

    if (this.formRef.current) {

      this.formRef.current.resetFields();

    }

    this.setState({ selectedCompanyBranch: {} });

  }

  private handleCompanyBranchSubmit = async(values: any): Promise<void> => {

    const hideLodingMessage = message.loading('Updating company branch into server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    values.finYears.forEach((obj: any) => {

      obj.startDate = obj.dates[0].format(Constants.DATE_FORMAT);
      obj.endDate = obj.dates[1].format(Constants.DATE_FORMAT);
      delete obj.dates;

    });
    try {

      let response;
      if (values._id) {

        response = await Axios.put<CompanyBranch>(`${AuthUris.COMPANY_BRANCH_URI}/${values._id}`, values, { headers: getAuthHeaders() });

      } else {

        response = await Axios.post<CompanyBranch>(AuthUris.COMPANY_BRANCH_URI, values, { headers: getAuthHeaders() });

      }
      if (response.status !== HTTP_OK) {

        message.error('Company branch update failed, please try again', ERROR_MESSAGE_DISPLAY_TIME);

      }

    } catch (error) {

      message.error('Company branch update failed, please try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();
      await this.getCompanyBranchData();

    }

  }


  private handleCompanyBranchRowEvents = (record: any): any => {

    const { formRef } = this;
    return {
      onClick: async() => {

        const response = await Axios.get<CompanyBranch>(`${AuthUris.COMPANY_BRANCH_URI}/${record._id}`, { headers: getAuthHeaders() });
        const companyBranch: CompanyBranch = response.data;
        const convertedObj: any = { ...companyBranch };
        convertedObj.finYears.forEach((effObj: any) => {

          effObj.dates = [];
          effObj.dates[0] = moment(effObj.startDate, Constants.DATE_FORMAT);
          effObj.dates[1] = moment(effObj.endDate, Constants.DATE_FORMAT);

        });
        convertedObj.company = convertedObj.company._id;
        this.setState({ selectedCompanyBranch: convertedObj });
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
            title={`Are you sure delete the company branch ${this.state.selectedCompanyBranch.name}?`}
            okText='Yes'
            cancelText='No'
            onConfirm={this.handleCompanyBranchDelete}
            disabled={!this.state.selectedCompanyBranch._id}
          >
            <Button type='primary' htmlType='button' disabled={!this.state.selectedCompanyBranch._id}>
              Delete
            </Button>
          </Popconfirm>
          <Button type='primary' htmlType='reset' onClick={this.handleCompanyBranchFormReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    );

  };

  private addFinanceButton = (add: any) => {

    return (
      <Form.Item style={{display: 'flex',
        justifyContent: 'flex-end'}}>
        <Button
          type='dashed'
          onClick={() => {

            add();

          }}
          style={{ width: '60%' }}
        >
          <PlusCircleOutlined /> Add tax details
        </Button>
      </Form.Item>
    );

  }

  private financialYearInputFieldHeading = () => {

    return (
      <Row gutter={24} style={{ margin: '0',
        marginBottom: '24px' }} >
        <Col span={6}>
          <label style={{fontSize: '14px'}}>Name</label>
        </Col>
        <Col span={12}>
          <label style={{fontSize: '14px'}}>Date Range</label>
        </Col>
        <Col span={6}>
          <label style={{fontSize: '14px'}}>Remove</label>
        </Col>
      </Row>
    );

  }

  private renderFinanceYearFrom = () => {

    const rules = [ {
      required: true,
      message: 'Financial year are required.'
    } ];
    return (
      <Col span={24} style={{border: '1px solid #010c17',
        marginBottom: '10px',
        padding: '10px',
        boxSizing: 'border-box'}}>
        <Form.List name='finYears'>
          {(fields, { add, remove }) => {

            return (
              <div>
                {this.financialYearInputFieldHeading()}
                {fields.map((field, index) => {

                  return (
                    <Row gutter={24} style={{ margin: '0' }} key={index}>
                      <Col span={6}>
                        <Form.Item name={[ field.name, 'name' ]} rules={rules}>
                          <Input placeholder='Financial year name' />

                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={[ field.name, 'dates' ]} rules={rules}>
                          <RangePicker format={Constants.DATE_FORMAT} showTime={false} />
                        </Form.Item>
                      </Col>

                      <Col span={6}>

                        {fields.length > 1 ? <MinusCircleOutlined onClick={() => {

                          remove(field.name);

                        }} /> : null}
                      </Col>
                    </Row>
                  );

                })}

                {this.addFinanceButton(add)}
              </div>
            );

          }}
        </Form.List>
      </Col>
    );

  };

  private renderCompanyBranchForm = () => {

    return (
      <Form {...layout} name='advanced_search' size='small' style={{ margin: 'auto',
        width: '100%'}} ref={this.formRef} onFinish={this.handleCompanyBranchSubmit}>
        <Form.Item name='_id' label='Hidden ID Field.' style={{ display: 'none' }} >
          <Input placeholder='Hidden field.' />
        </Form.Item>
        <Row style={{ display: 'flex'}}>
          <Col span={24} style={{ display: 'flex'}}>
            {this.companyBranchFormOne()}
            {this.companyBranchFormTwo()}
          </Col>
          {this.renderFinanceYearFrom()}
          {this.renderButtonPanel()}
        </Row>
      </Form>
    );

  }

  render() {

    return (
      <>
        {this.renderCompanyBranchForm()}
        <Table<CompanyBranch> dataSource={this.state.companyBranches} size='small' key='_id'
          pagination={false} onRow={this.handleCompanyBranchRowEvents} >
          <Table.Column<CompanyBranch> key='company.name' title='Company' dataIndex='company.name' />
          <Table.Column<CompanyBranch> key='name' title='Name' dataIndex='name' />
          <Table.Column<CompanyBranch> key='email' title='E-Mail' dataIndex='email' />
          <Table.Column<CompanyBranch> key='contact' title='Contact' dataIndex='contact' />
        </Table>
      </>
    );

  }

}

export default CompanyBranchComponent;
