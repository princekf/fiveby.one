import React, { Component } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../../session';
import { Button, Col, Input, Row, Table, DatePicker, InputNumber, Form, Popconfirm, Space, message } from 'antd';
import './Style.scss';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Constants, Tax as TaxEntity, InventoryUris } from 'fivebyone';
import { FormInstance } from 'antd/lib/form';
import moment from 'moment';
const { HTTP_OK } = Constants;
const { RangePicker } = DatePicker;

interface TaxItem {
  key: string;
  _id: string;
  groupName: string;
  name: string;
  startDate: string;
  endDate: string;
  percentage: number;
  children?: TaxItem[];
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};
interface TaxState {
  selectedTax: TaxEntity;
}
export class TaxComponent extends Component<TaxState, {}> {

  formRef = React.createRef<FormInstance>();

  state = {
    selectedTax: {
      _id: null,
      name: null,
    },
    taxTree: []
  }

  private handleTaxFormSubmit = async(values: any): Promise<void> => {

    const hideLodingMessage = message.loading('Updating tax into server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    values.effectiveFrom.forEach((obj: any) => {

      obj.startDate = obj.dates[0].format(Constants.DATE_FORMAT);
      obj.endDate = obj.dates[1].format(Constants.DATE_FORMAT);
      delete obj.dates;

    });

    try {

      let response;
      if (values._id) {

        response = await axios.put<TaxEntity>(`${InventoryUris.TAX_URI}/${values._id}`, values, { headers: getAuthHeaders() });

      } else {

        response = await axios.post<TaxEntity>(InventoryUris.TAX_URI, values, { headers: getAuthHeaders() });

      }

      if (response.status !== HTTP_OK) {

        message.error('Tax update failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }


    } catch (error) {

      message.error('Tax update failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();
      await this.getTaxes();

    }

  };

  private getTaxes = async(): Promise<void> => {

    const hideLodingMessage = message.loading('Fetching units from server...');
    try {

      const response = await axios.get<TaxEntity[]>(InventoryUris.TAX_URI, { headers: getAuthHeaders() });
      const taxes: TaxEntity[] = response.data;

      const taxTree: TaxItem[] = [];
      taxes.forEach((taxObj: TaxEntity) => {

        const treeObj: TaxItem = {
          key: taxObj._id,
          _id: taxObj._id,
          groupName: taxObj.groupName,
          name: taxObj.name,
          startDate: taxObj.effectiveFrom[0].startDate,
          endDate: taxObj.effectiveFrom[0].endDate,
          percentage: taxObj.effectiveFrom[0].percentage,

        };
        if (taxObj.effectiveFrom.length > 1) {

          treeObj.children = [];

        }
        taxObj.effectiveFrom.slice(1).forEach((effectiveFromO: any) => {

          const treeObjChild: TaxItem = {
            key: taxObj._id + effectiveFromO.startDate,
            _id: taxObj._id,
            groupName: '',
            name: '',
            startDate: effectiveFromO.startDate,
            endDate: effectiveFromO.endDate,
            percentage: effectiveFromO.percentage,
          };

          treeObj.children?.push(treeObjChild);

        });

        taxTree.push(treeObj);

      });
      await this.setState({ taxTree });

    } finally {

      hideLodingMessage();

    }

  };

  private handleTaxRowEvents = (record: any): any => {

    const { formRef } = this;
    return {
      onClick: async() => {

        const response = await axios.get<TaxEntity>(`${InventoryUris.TAX_URI}/${record._id}`, { headers: getAuthHeaders() });
        const tax: TaxEntity = response.data;
        const convertedObj = { ...tax };
        tax.effectiveFrom.forEach((effObj: any) => {

          effObj.dates = [];
          effObj.dates[0] = moment(effObj.startDate, Constants.DATE_FORMAT);
          effObj.dates[1] = moment(effObj.endDate, Constants.DATE_FORMAT);

        });
        this.setState({ selectedTax: convertedObj });
        if (formRef.current) {

          formRef.current.setFieldsValue(convertedObj);

        }

      }
    };

  };

  private handleTaxFormReset = (): void => {

    if (this.formRef.current) {

      this.formRef.current.resetFields();
      this.formRef.current.setFieldsValue({
        effectiveFrom: [ {} ]
      });

    }

    this.setState({ selectedTax: {} });

  };

  private handleTaxDelete = async(): Promise<void> => {

    const selectedID = this.formRef.current?.getFieldValue('_id');
    const hideLodingMessage = message.loading('Deleting tax from server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      const response = await axios['delete'](`${InventoryUris.TAX_URI}/${selectedID}`, { headers: getAuthHeaders() });
      if (response.status !== HTTP_OK) {

        message.error('Tax delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }
      if (this.formRef.current) {

        this.formRef.current.resetFields();
        this.formRef.current.setFieldsValue({
          effectiveFrom: [ {} ]
        });
        this.setState({ selectedTax: {} });

      }
      await this.getTaxes();

    } catch (err) {

      message.error('Tax delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }

  };

  async componentDidMount() {

    await this.getTaxes();
    const {formRef} = this;
    if (formRef.current) {

      formRef.current.setFieldsValue({
        effectiveFrom: [ {} ]
      });

    }

  }

  private taxInputFieldHeading = () => {

    return (
      <Row gutter={24} style={{ margin: '0',
        marginBottom: '24px' }} >
        <Col span={12}>
          <label style={{fontSize: '14px'}}>Date Range</label>
        </Col>
        <Col span={6}>
          <label style={{fontSize: '14px'}}>Tax rate</label>
        </Col>
        <Col span={6}>
          <label style={{fontSize: '14px'}}>Remove</label>
        </Col>
      </Row>
    );

  }

  private addTaxButton = (add: any) => {

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

  private renderEffectiveFrom = () => {

    const rules = [ {
      required: true,
      message: 'Effective dates and percentage are required.'
    } ];
    return (
      <Col style={{border: '1px solid #010c17',
        marginBottom: '10px',
        padding: '10px',
        boxSizing: 'border-box'}}>
        <Form.List name='effectiveFrom'>
          {(fields, { add, remove }) => {

            return (
              <div>
                {this.taxInputFieldHeading()}
                {fields.map((field) => {

                  return <>
                    <Row gutter={24} style={{ margin: '0' }} key={field.key}>
                      <Col span={12}>
                        <Form.Item name={[ field.name, 'dates' ]} rules={rules}>
                          <RangePicker format={Constants.DATE_FORMAT} showTime={false} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item name={[ field.name, 'percentage' ]} rules={rules}>
                          <InputNumber placeholder='Tax rate' />

                        </Form.Item>
                      </Col>
                      <Col span={6}>

                        {fields.length > 1 ? <MinusCircleOutlined onClick={() => {

                          remove(field.name);

                        }} /> : null}
                      </Col>
                    </Row>
                  </>;

                }
                )}
                {this.addTaxButton(add)}
              </div>
            );

          }}
        </Form.List>
      </Col>
    );

  };

  private renderButtonPanel = () => {

    return (
      <Form.Item {...tailLayout}>
        <Space size='large'>
          <Button type='primary' htmlType='submit'>
                Submit
          </Button>
          <Popconfirm
            title={`Are you sure delete the unit ${this.state.selectedTax.name}?`}
            okText='Yes'
            cancelText='No'
            onConfirm={this.handleTaxDelete}
            disabled={!this.state.selectedTax._id}
          >
            <Button type='primary' htmlType='button' disabled={!this.state.selectedTax._id}>
                  Delete
            </Button>
          </Popconfirm>
          <Button type='primary' htmlType='reset' onClick={this.handleTaxFormReset}>
                Reset
          </Button>
        </Space>
      </Form.Item>
    );

  };

  private renderTaxForm = () => {

    return (
      <Form {...layout} name='tax-form' size='small' onFinish={this.handleTaxFormSubmit} ref={this.formRef} >
        <Form.Item name='_id' label='Hidden ID Field.' style={{ display: 'none' }} >
          <Input placeholder='Hidden field.' />
        </Form.Item>
        <Row gutter={24} style={{ margin: '0' }}>
          <Col span={12}>
            <Form.Item name='groupName' label='Group Name'
              rules={[
                {
                  required: true,
                  message: 'Tax group name is required',
                },
              ]}
            >
              <Input placeholder='Group name of tax' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='name' label='Name'
              rules={[
                {
                  required: true,
                  message: 'Tax name is required',
                },
              ]}
            >
              <Input placeholder='Name of tax' />
            </Form.Item>
          </Col>
        </Row>

        {this.renderEffectiveFrom()}

        {this.renderButtonPanel()}
      </Form>
    );

  };

  render() {

    return (
      <>
        {this.renderTaxForm()}
        <Table<TaxItem> dataSource={this.state.taxTree} size='small' key='key'
          pagination={false} onRow={this.handleTaxRowEvents}>
          <Table.Column<TaxItem> key='groupName' title='Group Name' dataIndex='groupName' />
          <Table.Column<TaxItem> key='name' title='Name' dataIndex='name' />
          <Table.Column<TaxItem> key='startDate' title='From Date' dataIndex='startDate' />
          <Table.Column<TaxItem> key='endDate' title='To Date' dataIndex='endDate' />
          <Table.Column<TaxItem> key='percentage' title='Tax Rate' dataIndex='percentage' />
        </Table>
      </>
    );

  }

}

export default TaxComponent;
