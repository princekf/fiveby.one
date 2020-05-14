import React, { Component } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../../session';
import { Button, Col, Input, Row, Table, Select, Form, InputNumber, Space, Popconfirm, message } from 'antd';
import { FormInstance } from 'antd/lib/form';
import './Style.scss';
import {Constants, Unit, InventoryUris} from 'fivebyone';
const { HTTP_OK } = Constants;

interface UState {
  units: Unit[];
  selectedUnit: Unit;
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

export class UnitComponent extends Component<UState, {}> {

  formRef = React.createRef<FormInstance>();

  state = {
    units: new Array<Unit>(0),
    unitTree: [],
    selectedUnit: {
      _id: '',
      name: '',
      shortName: '',
      baseUnit: '',
    }
  }

  private generateFormItemsTwo = () => {

    return (
      <>
        <Col span={12}>
          <Form.Item name='baseUnit' label='Base Unit' >
            <Select showSearch={true} allowClear={true}
              filterOption={(input, option) => {

                return option?.children.toLowerCase().indexOf(input.toLowerCase()) > -1;

              }}
            >
              {this.state.units.map((unit) => {

                return <Select.Option key={unit._id} value={unit._id}>{unit.name}</Select.Option>;

              }
              )}
            </Select>
          </Form.Item>
          <Form.Item
            name='times'
            label='Times'
          >
            <InputNumber placeholder='Ratio between base unit and unit' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='decimalPlaces' label='Decimal Places' >
            <Select defaultValue={0} style={{ width: 120 }}>
              <Select.Option value={0}>0</Select.Option>
              <Select.Option value={1}>1</Select.Option>
              <Select.Option value={2}>2</Select.Option>
              <Select.Option value={3}>3</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </>
    );

  }

  private generateFormItems = () => {

    return (
      <>
        <Form.Item name='_id' label='Hidden ID Field.'
          style={{ display: 'none' }}
        >
          <Input placeholder='Hidden field.' />
        </Form.Item>
        <Row>
          <Col span={12}>
            <Form.Item name='name' label='Name'
              rules={[
                {
                  required: true,
                  message: 'Name required!',
                },
              ]}
            >
              <Input placeholder='Enter name of unit' />
            </Form.Item>
            <Form.Item name='shortName' label='Short Name'
              rules={[
                {
                  required: true,
                  message: 'Short name required!',
                },
              ]}
            >
              <Input placeholder='Enter short name of unit' />
            </Form.Item>
          </Col>
          {this.generateFormItemsTwo()}
        </Row>
      </>
    );

  };

  private handleUnitDelete = async(): Promise<void> => {

    const selectedID = this.formRef.current?.getFieldValue('_id');
    const hideLodingMessage = message.loading('Deleting unit from server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      const response = await axios['delete']<Unit[]>(`${InventoryUris.UNIT_URI}/${selectedID}`, { headers: getAuthHeaders() });
      if (response.status !== HTTP_OK) {

        message.error('Unit delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }
      if (this.formRef.current) {

        this.formRef.current.resetFields();

      }
      await this.getUnits();
      this.convertUnitsIntoTree();

    } catch (err) {

      message.error('Unit delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }

  };

  private handleUnitFormReset = (): void => {

    if (this.formRef.current) {

      this.formRef.current.resetFields();

    }

    this.setState({ selectedUnit: {} });

  };

  private generateFormButtons = () => {

    return (
      <Form.Item {...tailLayout}>
        <Space size='large'>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
          <Popconfirm
            title={`Are you sure delete the unit ${this.state.selectedUnit.name}?`}
            okText='Yes'
            cancelText='No'
            onConfirm={this.handleUnitDelete}
            disabled={!this.state.selectedUnit._id}
          >
            <Button type='primary' htmlType='button' disabled={!this.state.selectedUnit._id}>
              Delete
            </Button>
          </Popconfirm>
          <Button type='primary' htmlType='reset' onClick={this.handleUnitFormReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    );

  };

  private generateUnitForm = () => {

    return (
      <Form {...layout} name='advanced_search' size='small' onFinish={this.handleUnitUpdate} ref={this.formRef}
        style={{ margin: 'auto',
          width: '100%'}}
      >
        {this.generateFormItems()}
        {this.generateFormButtons()}
      </Form>
    );

  };

  private handleUnitUpdate = async(values: any): Promise<void> => {

    if (!values.baseUnit) {

      values.baseUnit = null;

    }
    const hideLodingMessage = message.loading('Updating unit into server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;

    try {

      let response;
      if (!values.decimalPlaces) {

        values.decimalPlaces = 0;

      }
      if (values._id) {

        response = await axios.put<Unit>(`${InventoryUris.UNIT_URI}/${values._id}`, values, { headers: getAuthHeaders() });

      } else {

        // Save fresh unit
        response = await axios.post<Unit>(InventoryUris.UNIT_URI, values, { headers: getAuthHeaders() });

      }
      if (response.status !== HTTP_OK) {

        message.error('Unit update failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }

      await this.getUnits();
      this.convertUnitsIntoTree();

    } catch (error) {

      message.error('Unit update failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }

  };


  private convertUnitsIntoTree = (): void => {

    const unitTree: any = [];
    const unitMap: any = {};
    this.state.units.forEach((item: Unit) => {

      if (!unitMap[item._id]) {

        unitMap[item._id] = {};

      }
      unitMap[item._id].key = item._id;
      unitMap[item._id]._id = item._id;
      unitMap[item._id].name = item.name;
      unitMap[item._id].shortName = item.shortName;
      unitMap[item._id].baseUnit = item.baseUnit;
      unitMap[item._id].times = item.times;
      unitMap[item._id].decimalPlaces = item.decimalPlaces;
      if (item.baseUnit) {

        if (!unitMap[item.baseUnit._id]) {

          unitMap[item.baseUnit._id] = {};

        }
        if (!unitMap[item.baseUnit._id].children) {

          unitMap[item.baseUnit._id].children = [];

        }

        unitMap[item.baseUnit._id].children.push(unitMap[item._id]);

      } else {

        unitTree.push(unitMap[item._id]);

      }

    });

    this.setState({ unitTree });

  };

  private getUnits = async(): Promise<void> => {

    const hideLodingMessage = message.loading('Fetching units from server...');
    try {

      const response = await axios.get<Unit[]>(InventoryUris.UNIT_URI, { headers: getAuthHeaders() });
      const units = response.data;
      await this.setState({ units });

    } finally {

      hideLodingMessage();

    }

  };

  async componentDidMount() {

    await this.getUnits();
    this.convertUnitsIntoTree();

  }

  private handleUnitRowEvents = (record: any): any => {

    const { formRef } = this;
    return {
      onClick: () => {

        const selectedItem = {
          _id: record._id,
          name: record.name,
          shortName: record.shortName,
          baseUnit: record.baseUnit ? record.baseUnit._id : '',
          times: record.times,
          decimalPlaces: record.decimalPlaces,
        };

        this.setState({ selectedUnit: selectedItem });

        if (formRef.current) {

          formRef.current.setFieldsValue(selectedItem);

        }

      }
    };

  }

  render() {

    return (
      <>
        {this.generateUnitForm()}
        <Table<Unit> dataSource={this.state.unitTree} size='small' key='_id'
          pagination={false} onRow={this.handleUnitRowEvents}>
          <Table.Column<Unit> key='name' title='Name' dataIndex='name' />
          <Table.Column<Unit> key='shortName' title='Short Name' dataIndex='shortName' />
          <Table.Column<Unit> key='decimalPlaces' title='Decimal Places' dataIndex='decimalPlaces' />
          <Table.Column<Unit> key='times' title='Times' dataIndex='times' />
        </Table>
      </>
    );

  }

}

export default UnitComponent;
