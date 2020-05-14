import React, { Component } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../../session';
import { Button, Col, Input, Row, Table, DatePicker, InputNumber, Form, Popconfirm, Space, message } from 'antd';
import './Style.scss';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {Constants, Tax, InventoryUris} from 'fivebyone';
import { FormInstance } from 'antd/lib/form';
const { HTTP_OK } = Constants;
const { RangePicker } = DatePicker;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const layout1 = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

const tailLayout = {
  wrapperCol: {
    offset: 12,
    span: 12,
  },
};

interface TaxS {
  taxs: TaxS[];
  selectedTax: Tax;
}


const dateFormatList = [ 'DD/MM/YYYY', 'DD/MM/YY' ];

export class TaxComponent extends Component<TaxS, {}> {

  formRef = React.createRef<FormInstance>();

  state = {
    taxs: new Array<Tax>(0),
    taxTree: [],
    selectedTax: {
      key: '',
      _id: '',
      groupName: '',
      name: '',
      effectiveFrom: [ {
        startDate: null,
        endDate: null,
        percentage: null
      } ]
    }
  }

  private generateFormOne = () => {

    return (
      <Col span={12} style={{ padding: '0 15px',
        boxSizing: 'border-box'}}>
        <Form.Item name='_id' label='Hidden ID Field.'
          style={{ display: 'none' }}
        >
          <Input placeholder='Hidden field.' />
        </Form.Item>
        <Form.Item
          name='name'
          label='Name'
        >
          <Input placeholder='Enter tax name' />
        </Form.Item>
        <Form.Item
          name='groupName'
          label='Group Name'
        >
          <Input placeholder='Enter tax group name' />
        </Form.Item>
        <Form.Item
          name='printName'
          label='Print Name'
        >
          <Input placeholder='Enter print name' />
        </Form.Item>
      </Col>

    );

  }

  private generateFormTwo = () => {

    return (
      <Col span={12} style={{ padding: '0 15px',
        boxSizing: 'border-box'}}>
        <Form.Item name='taxLedger' label='Tax Ledger'>
          <Input placeholder='Enter tax ledger' />
        </Form.Item>
        <Form.Item name='salesLedger'label='Sales Ledger'>
          <Input placeholder='Enter sales ledger' />
        </Form.Item>
        <Form.Item name='purchaseLedger' label='Purchase Ledger'>
          <Input placeholder='Enter purchase ledger' />
        </Form.Item>
      </Col>
    );

  }

  private generateFormThree = () => {

    return (
      <>
        <h4 className='text' style={{width: 'auto'}}>Tax Rate and Effective Rate</h4>
        <Form.Item
          {...layout1} name='date' label='Effective From'
          style={{display: 'block'}}
        >
          <RangePicker format={dateFormatList} />
        </Form.Item>

        <Form.Item
          {...layout1} name='taxRate' label='Tax Rate'
          style={{display: 'block',
            marginLeft: '10px'}}
        >
          <InputNumber min={1} max={100000} />
        </Form.Item>

        <Form.Item style={{display: 'flex',
          width: '150px',
          paddingTop: '30px'}}>
          <Button shape='circle' icon={<MinusCircleOutlined />} style={{margin: '0 10px'}}></Button>
          <Button shape='circle' icon={<PlusCircleOutlined />}></Button>
        </Form.Item>
      </>
    );

  }


  private handleTaxFormReset = (): void => {

    if (this.formRef.current) {

      this.formRef.current.resetFields();

    }

    this.setState({ selectedTax: {} });

  };

  private handleTaxDelete = async(): Promise<void> => {

    const selectedID = this.formRef.current?.getFieldValue('_id');
    const hideLodingMessage = message.loading('Deleting tax from server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      const response = await axios['delete']<Tax[]>(`${InventoryUris.TAX_URI}/${selectedID}`, { headers: getAuthHeaders() });
      if (response.status !== HTTP_OK) {

        message.error('Tax delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }
      if (this.formRef.current) {

        this.formRef.current.resetFields();

      }
      await this.getTaxs();

    } catch (err) {

      message.error('Tax delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }

  }

  private getTaxs = async(): Promise<void> => {

    const hideLodingMessage = message.loading('Fetching taxs from server...');
    try {
      const taxMap: any = {};
      const taxTree: any = [];

      const response = await axios.get<Tax[]>(InventoryUris.TAX_URI, { headers: getAuthHeaders() });
      const taxs = response.data;
      taxs.forEach((item: Tax) => {
        taxMap.key = item._id;
        taxMap._id = item._id;
        taxMap.groupName = item.groupName;
        taxMap.name = item.name;
        taxTree.push(taxMap);

      })

      await this.setState({ taxTree });

    } finally {

      hideLodingMessage();

    }

  };

  async componentDidMount() {

    await this.getTaxs();

  }

  private generateFormButtons = () => {

    return (
      <Form.Item {...tailLayout} style={{width: '100%'}}>
        <Space size='large'>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
          <Popconfirm
            title={`Are you sure delete the tax ${this.state.selectedTax.name}?`}
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

  private handleTaxRowEvents = (record: any): any => {

    const { formRef } = this;
    return {
      onClick: () => {

        const selectedItem = {
          _id: record._id,
          name: record.name,
          groupName: record.groupName,
          effectiveFrom: [ {
            startDate: Date,
            endDate: Date,
            percentage: record.times
          } ]
        };

        this.setState({ selectedTax: selectedItem });

        if (formRef.current) {

          formRef.current.setFieldsValue(selectedItem);

        }

      }
    };

  }

  private handleTaxUpdate = async(values: any): Promise<void> => {

    const hideLodingMessage = message.loading('Updating tax into server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;

    try {

      let response;
      if (values._id) {

        response = await axios.put<Tax>(`${InventoryUris.TAX_URI}/${values._id}`, values, { headers: getAuthHeaders() });

      } else {

        // Save fresh tax
        response = await axios.post<Tax>(InventoryUris.TAX_URI, values, { headers: getAuthHeaders() });

      }
      if (response.status !== HTTP_OK) {

        message.error('Tax update failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }

      await this.getTaxs();

    } catch (error) {

      message.error('Tax update failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }

  };

  render() {

    return (
      <>
        <Form
          {...layout}
          name='advanced_search'
          size='small' onFinish={this.handleTaxUpdate} ref={this.formRef}
          style={{ margin: 'auto',
            width: '100%'}}
        >
          <Row style={{ display: 'flex'}}>
            <Col span={24} style={{ display: 'flex'}}>
              {this.generateFormOne()}
              {this.generateFormTwo()}
            </Col>
            <Col span={24} className='box' style={{display: 'flex',
              paddingLeft: '15px',
              margin: '10px 0'}}>
              {this.generateFormThree()}
            </Col>
            {this.generateFormButtons()}
            <Col span={24}>
              <Table<Tax> dataSource={this.state.taxTree} size='small' key='_id'
                pagination={false} onRow={this.handleTaxRowEvents}>
                <Table.Column<Tax> key='name' title='Name' dataIndex='name' />
                <Table.Column<Tax> key='groupName' title='Group Name' dataIndex='groupName' />
              </Table>
            </Col>
          </Row>
        </Form>

      </>
    );

  }

}

export default TaxComponent;
