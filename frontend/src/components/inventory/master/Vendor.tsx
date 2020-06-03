import React, { Component, ReactNode } from 'react';
import { Button, Col, Input, Row, Table, Form, message, Space, Popconfirm, Switch, Card } from 'antd';
import './Style.scss';
import { MinusCircleOutlined, PlusCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Axios from 'axios';
import { getAuthHeaders } from '../../../session';
import { InventoryUris, Constants, Party } from 'fivebyone';
import { FormInstance } from 'antd/lib/form';
const { HTTP_OK } = Constants;

const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

interface PartyT extends Party {
  key: string;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 13 }
};

interface PState {
  partys: Party[];
  selectedParty: PState;
}

export class Vendor extends Component<PState, {}> {

  formRef = React.createRef<FormInstance>();

  state = {
    partys: [],
    selectedParty: {
      _id: null,
      name: null
    }
  }

  async componentDidMount() {

    await this.getPartyData();
    const { formRef } = this;
    if (formRef.current) {

      formRef.current.setFieldsValue({
        addresses: [ {} ],
        registrationNumbers: [ {} ],
        isCustomer: true
      });

    }

  }

  private handlePartySubmit = async(values: any): Promise<void> => {

    const hideLodingMessage = message.loading('Updating party into server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      let response;

      if (values._id) {

        response = await Axios.put<Party>(`${InventoryUris.PARTY_URI}/${values._id}`, values, { headers: getAuthHeaders() });

      } else {

        response = await Axios.post<Party>(InventoryUris.PARTY_URI, values, { headers: getAuthHeaders() });

      }
      if (response.status !== HTTP_OK) {

        message.error('Party update failed, please try again', ERROR_MESSAGE_DISPLAY_TIME);

      }

    } catch (error) {

      message.error('Party update failed, please try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();
      await this.getPartyData();

    }

  }

  private handlePartyDelete = async(): Promise<void> => {

    const selectedID = this.formRef.current?.getFieldValue('_id');
    const hideLodingMessage = message.loading('Deleting tax from server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      const response = await Axios['delete'](`${InventoryUris.PARTY_URI}/${selectedID}`, { headers: getAuthHeaders() });
      if (response.status !== HTTP_OK) {

        message.error('Party delete failed, please try again', ERROR_MESSAGE_DISPLAY_TIME);

      }
      if (this.formRef.current) {

        this.formRef.current.resetFields();
        this.formRef.current.setFieldsValue({
          addresses: [ {} ],
          registrationNumbers: [ {} ],
          isCustomer: true
        });
        this.setState({ selectedParty: {} });

      }
      await this.getPartyData();

    } catch (err) {

      message.error('Party delete failed, please try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }

  };

  private handlePartyFormReset = (): void => {

    if (this.formRef.current) {

      this.formRef.current.resetFields();
      this.formRef.current.setFieldsValue({
        addresses: [ {} ],
        registrationNumbers: [ {} ],
        isCustomer: true
      });

    }

    this.setState({ selectedParty: {} });

  };

  private renderButtonPanel = () => {

    return (
      <Form.Item {...tailLayout} style={{ width: '100%' }}>
        <Space size='large'>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
          <Popconfirm
            title={`Are you sure delete the unit ${this.state.selectedParty.name}?`}
            okText='Yes'
            cancelText='No'
            onConfirm={this.handlePartyDelete}
            disabled={!this.state.selectedParty._id}
          >
            <Button type='primary' htmlType='button' disabled={!this.state.selectedParty._id}>
              Delete
            </Button>
          </Popconfirm>
          <Button type='primary' htmlType='reset' onClick={this.handlePartyFormReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    );

  };

  private handlePartyRowEvents = (record: any): any => {

    const { formRef } = this;
    return {
      onClick: async() => {

        const response = await Axios.get<Party>(`${InventoryUris.PARTY_URI}/${record._id}`, { headers: getAuthHeaders() });
        const party: Party = response.data;
        const convertedObj = { ...party };
        this.setState({ selectedParty: convertedObj });
        if (formRef.current) {

          formRef.current.setFieldsValue(convertedObj);

        }

      }
    };

  };

  private renderPersonalData = () => {

    return <>
      <Col span={8}>
        <Form.Item name='name' label='Name' rules={[ {
          required: true,
          message: 'Name is required'
        } ]}>
          <Input placeholder='Enter your name' />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item name='code' label='Code' rules={[ {
          required: true,
          message: 'Code is required'
        } ]}>
          <Input placeholder='Enter your code' />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item name='mobile' label='Mobile' rules={[ {
          required: true,
          message: 'Mobile is required'
        } ]}>
          <Input placeholder='Enter your mobile number' />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item name='email' label='Email id' rules={[ {
          required: true,
          message: 'Email-Id is required'
        } ]}>
          <Input placeholder='Enter your Email id' />
        </Form.Item>
      </Col>
    </>;

  }

  private renderPrimaryFields = () => {

    return <Row gutter={24}>
      {this.renderPersonalData()}
      <Col span={8}>
        <Form.Item name='isCustomer' label='Is a Customer ?' valuePropName='checked'
        >
          <Switch />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item name='isVendor' label='Is a Vendor ?' valuePropName='checked'
        >
          <Switch />
        </Form.Item>
      </Col>
    </Row>;

  }

  private renderRegionalInfo = (field: any) => {

    return (
      <>
        <Col span={8}>
          <Form.Item name={[ field.name, 'addressLine1' ]} label='Address line 1' rules={[ {
            required: true,
            message: 'Address line 1 is required'
          } ]}>
            <Input placeholder='Enter the addressLine1' />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={[ field.name, 'addressLine2' ]} label='Address line 2'>
            <Input placeholder='Enter the address line 2' />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={[ field.name, 'addressLine3' ]} label='Address line 3'>
            <Input placeholder='Enter the Address line 3' />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={[ field.name, 'addressLine4' ]} label='Address line 4'>
            <Input placeholder='Enter the Address line 4' />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={[ field.name, 'state' ]} label='State'>
            <Input placeholder='Enter the name of the State' />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={[ field.name, 'country' ]} label='Country'>
            <Input placeholder='Enter the name of the Country' />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={[ field.name, 'pinCode' ]} label='Pincode'>
            <Input placeholder='Enter the pincode' />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={[ field.name, 'landMark' ]} label='Landmark'>
            <Input placeholder='Enter the landmark' />
          </Form.Item>
        </Col>
      </>
    );

  }

  private renderContactInfo = (field: any) => {

    return <Row gutter={24}>
      <Col span={8}>
        <Form.Item name={[ field.name, 'type' ]} label='Type' rules={[ {
          required: true,
          message: 'Type is required'
        } ]}>
          <Input placeholder='Enter the type' />
        </Form.Item>
      </Col>
      {this.renderRegionalInfo(field)}
    </Row>;

  }

  private renderAddressFields() {

    return (

      <Form.List name='addresses' >
        {(fields, { add, remove }) => {

          return (
            <div style={{
              border: '1px solid #010c17',
              marginBottom: '10px',
              padding: '10px',
              boxSizing: 'border-box'

            }}>
              {fields.map((field) => {

                return <div key={field.key}>
                  {this.renderContactInfo(field)}
                  <Form.Item {...tailLayout} >
                    {fields.length > 1 ? <Button icon={<MinusCircleOutlined />} style={{ width: '30%' }} onClick={() => {

                      remove(field.name);

                    }}> Delete address row</Button> : null}
                  </Form.Item>
                  <hr />
                </div>;

              }
              )}
              <Form.Item {...tailLayout}>
                <Button
                  type='dashed'
                  onClick={() => {

                    add();

                  }}
                  style={{ width: '30%' }}
                >
                  <PlusCircleOutlined /> Add another address
                </Button>
              </Form.Item>
            </div>
          );

        }}
      </Form.List>
    );

  }

  private renderRegistrationFields = () => {

    return (
      <Form.List name='registrationNumbers'>

        {(fields, { add, remove }) => {

          return (
            <div style={{
              border: '1px solid #010c17',
              marginBottom: '10px',
              padding: '10px',
              boxSizing: 'border-box'
            }}>
              {fields.map((field) => {

                return <div key={field.key}>
                  <Row gutter={24}>
                    <Col span={8}>
                      <Form.Item name={[ field.name, 'name' ]} label='Name'>
                        <Input placeholder='Enter Registration name' />
                      </Form.Item>
                    </Col>
                    < Col span={8}>
                      <Form.Item name={[ field.name, 'value' ]} label='Value'>
                        <Input placeholder='Enter Registration number' />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item {...tailLayout}>
                    {fields.length > 1 ? <Button icon={<MinusCircleOutlined />} style={{ width: '30%' }} onClick={() => {

                      remove(field.name);

                    }}> Delete registration row</Button> : null}
                  </Form.Item>
                  <hr />
                </div>;

              }
              )}
              <Form.Item {...tailLayout}>
                <Button

                  type='dashed'
                  onClick={() => {

                    add();

                  }}
                  style={{ width: '30%' }}
                >
                  <PlusCircleOutlined /> Add another registration data
                </Button>
              </Form.Item>
            </div>
          );

        }}
      </Form.List>);

  }

  private getPartyData = async(): Promise<void> => {

    const hideLodingMessage = message.loading('Fetching units from server...');
    try {

      const response = await Axios.get<PartyT[]>(InventoryUris.PARTY_URI, { headers: getAuthHeaders() });
      const partys: PartyT[] = response.data;

      partys.forEach((partObj) => {

        partObj.key = partObj._id;

      });

      await this.setState({ partys });


    } finally {

      hideLodingMessage();

    }

  };

  private renderPartyForm = () => {

    return (

      <Form {...layout} layout='horizontal' size='small' ref={this.formRef} onFinish={this.handlePartySubmit}>
        <Form.Item name='_id' label='Hidden ID Field.' style={{ display: 'none' }} >
          <Input placeholder='Hidden field.' />
        </Form.Item>
        {this.renderPrimaryFields()}
        {this.renderAddressFields()}
        {this.renderRegistrationFields()}
        <Row>
          {this.renderButtonPanel()}
        </Row>
      </Form>);

  }

  render() {

    return (
      <>
        {this.renderPartyForm()}
        <Table<Party> expandable={{
          expandedRowRender: (record) => {

            return this.renderPartyDetails(record);

          },
        }} dataSource={this.state.partys} size='small' key='_id'
        pagination={false} onRow={this.handlePartyRowEvents} >
          <Table.Column<Party> key='name' title='Name' dataIndex='name' />
          <Table.Column<Party> key='code' title='Code' dataIndex='code' />
          <Table.Column<Party> key='email' title='E-Mail' dataIndex='email' />
          <Table.Column<Party> key='mobile' title='Mobile' dataIndex='mobile' />
          <Table.Column<Party> key='isCustomer' title='Customer' dataIndex='isCustomer' render={this.renderPartyCustomerColumn} />
          <Table.Column<Party> key='isVendor' title='Vendor' dataIndex='isVendor' render={this.renderPartyVendorColumn} />
        </Table>
      </>
    );

  }

  private renderPartyDetails = (record: Party) => {

    return (
      <Row gutter={24}>
        {record.addresses.map((address, index) => {

          return <Col span={4} key={index}>
            <Card title={address.type} bordered={false} hoverable>
              {address.addressLine1 ? address.addressLine1 : ''}
              {address.addressLine2 ? `, ${address.addressLine2}` : ''}
              {address.addressLine3 ? `, ${address.addressLine3}` : ''}
              {address.addressLine4 ? `, ${address.addressLine4}` : ''}
              {address.state ? `, ${address.state}` : ''}
              {address.country ? `, ${address.country}` : ''}
              {address.pinCode ? `, ${address.pinCode}` : ''}
              {address.landMark ? `, ${address.landMark}` : ''}
            </Card>
          </Col>;


        })}
        {record.registrationNumbers.map((registerNum, index) => {

          if ((registerNum.name && registerNum.name !== '') || (registerNum.value && registerNum.value !== '')) {

            return <Col span={4} key={index}>
              <Card title={`Registration Details ${index + 1}`} bordered={false} hoverable style={{ height: '100%' }}>
                {this.checkAndRenderRegistrationData('Name', registerNum.name)}
                {this.checkAndRenderRegistrationData('Value', registerNum.value)}
              </Card>
            </Col>;

          }
          return <></>;

        }

        )}
      </Row>
    );

  }

  private checkAndRenderRegistrationData = (key: string, value: string) => {

    return (
      <>
        {
          value && value !== '' ? <>
            <label style={{
              marginRight: '15px',
              fontWeight: 'bold'
            }}>{key}</label>
            {value}<br />
          </> : ''
        }
      </>
    );

  }

  private renderPartyVendorColumn = (text: string, record: Party): ReactNode => {

    return (
      record.isVendor ? <CheckCircleOutlined /> : <CloseCircleOutlined />
    );

  };

  private renderPartyCustomerColumn = (text: string, record: Party): ReactNode => {

    return (
      record.isCustomer ? <CheckCircleOutlined /> : <CloseCircleOutlined />
    );

  };


}

export default Vendor;
