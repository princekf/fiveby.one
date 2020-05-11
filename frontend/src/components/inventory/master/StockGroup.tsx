import React, { Component } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../../session';
import { Form, Button, Col, Input, Row, Table, Select, Space, message, Popconfirm } from 'antd';
import './Style.scss';
import { Constants, ProductGroup } from 'fivebyone';
import { FormInstance } from 'antd/lib/form';
const { Option } = Select;
const { HTTP_OK } = Constants;

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


interface ProductGroupState {
  productGroups: ProductGroup[];
  selectedProductGroup: ProductGroup;
}


export class StockGroup extends Component<ProductGroupState, {}> {

  formRef = React.createRef<FormInstance>();

  productGroupTree: any = [];

  state = {
    productGroups: new Array<ProductGroup>(0),
    productGroupTree: [],
    selectedProductGroup: {
      _id: '',
      name: '',
      shortName: '',
      parent: '',
    }
  }

  private handlePoductGroupUpdate = async(values: any): Promise<void> => {

    if (!values.parent) {

      values.parent = null;

    }

    const hideLodingMessage = message.loading('Updating product into server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      let response;

      if (values._id) {

        response = await axios.put<ProductGroup>(`/api/inventory/productgroup/${values._id}`, values, { headers: getAuthHeaders() });

      } else {

        // Save fresh group
        response = await axios.post<ProductGroup>('/api/inventory/productgroup', values, { headers: getAuthHeaders() });

      }
      if (response.status !== HTTP_OK) {

        message.error('Product group update failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }

      await this.getProductGroups();
      this.convertProductGroupsIntoTree();

    } catch (error) {

      message.error('Product group update failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }

  };


  private handleProductGroupRowEvents = (record: any): any => {

    const { formRef } = this;
    return {
      onClick: () => {

        const selectedItem = {
          _id: record._id,
          name: record.name,
          shortName: record.shortName,
          parent: record.parent ? record.parent._id : '',
        };

        this.setState({ selectedProductGroup: selectedItem });

        if (formRef.current) {

          formRef.current.setFieldsValue(selectedItem);

        }

      }
    };

  };


  private convertProductGroupsIntoTree = (): void => {

    const productGroupTree: any = [];
    const productGroupMap: any = {};
    this.state.productGroups.forEach((item: ProductGroup) => {

      if (!productGroupMap[item._id]) {

        productGroupMap[item._id] = {};

      }
      productGroupMap[item._id].key = item._id;
      productGroupMap[item._id]._id = item._id;
      productGroupMap[item._id].name = item.name;
      productGroupMap[item._id].shortName = item.shortName;
      productGroupMap[item._id].parent = item.parent;
      if (item.parent) {

        if (!productGroupMap[item.parent._id]) {

          productGroupMap[item.parent._id] = {};

        }
        if (!productGroupMap[item.parent._id].children) {

          productGroupMap[item.parent._id].children = [];

        }

        productGroupMap[item.parent._id].children.push(productGroupMap[item._id]);

      } else {

        productGroupTree.push(productGroupMap[item._id]);

      }

    });

    this.setState({ productGroupTree });

  };


  private getProductGroups = async(): Promise<void> => {

    const hideLodingMessage = message.loading('Fetching product groups from server...');
    try {

      const response = await axios.get<ProductGroup[]>('/api/inventory/productgroup', { headers: getAuthHeaders() });
      const productGroups = response.data;
      this.setState({ productGroups });

    } finally {

      hideLodingMessage();

    }

  };

  private handleProductGroupFormReset = (): void => {

    if (this.formRef.current) {

      this.formRef.current.resetFields();

    }

    this.setState({ selectedProductGroup: {} });

  };

  private handleProductGroupDelete = async(): Promise<void> => {

    const selectedID = this.formRef.current?.getFieldValue('_id');
    const hideLodingMessage = message.loading('Deleting product groups from server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      const response = await axios['delete']<ProductGroup[]>(`/api/inventory/productgroup/${selectedID}`, { headers: getAuthHeaders() });
      if (response.status !== HTTP_OK) {

        message.error('Product group delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }
      if (this.formRef.current) {

        this.formRef.current.resetFields();

      }
      await this.getProductGroups();
      this.convertProductGroupsIntoTree();

    } catch (err) {

      message.error('Product group delete failed, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }

  };

  async componentDidMount() {

    await this.getProductGroups();
    this.convertProductGroupsIntoTree();

  }

  private generateFormItemLayout = () => {

    return (
      <>
        <Form.Item name='_id' label='Hidden ID Field.'
          style={{ display: 'none' }}
        >
          <Input placeholder='Hidden field.' />
        </Form.Item>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name='name' label='Name'
              rules={[
                {
                  required: true,
                  message: 'Product name is required',
                },
              ]}
            >
              <Input placeholder='Name of product' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='shortName'
              label='Short Name'
            >
              <Input placeholder='Short name of product' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='parent'
              label='Parent Group'>
              <Select showSearch={true} allowClear={true}
                filterOption={(input, option) => {

                  return option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

                }}
              >
                {this.state.productGroups.map((productGroup) => {

                  return <Option key={productGroup._id} value={productGroup._id}>{productGroup.name}</Option>;

                }
                )}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </>
    );

  }

  private generateButtonLayout = () => {

    return (
      <Form.Item {...tailLayout}>
        <Space size='large'>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
          <Popconfirm
            title={`Are you sure delete the group ${this.state.selectedProductGroup.name}?`}
            okText='Yes'
            cancelText='No'
            onConfirm={this.handleProductGroupDelete}
            disabled={!this.state.selectedProductGroup._id}
          >
            <Button type='primary' htmlType='button' disabled={!this.state.selectedProductGroup._id}>
              Delete
            </Button>
          </Popconfirm>
          <Button type='primary' htmlType='reset' onClick={this.handleProductGroupFormReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    );

  };

  render() {

    return (
      <>
        <Form
          {...layout} ref={this.formRef}
          size='small'
          onFinish={this.handlePoductGroupUpdate}
        >
          {this.generateFormItemLayout()}
          {this.generateButtonLayout()}
        </Form>
        <Table<ProductGroup> dataSource={this.state.productGroupTree} size='small' key='_id'
          pagination={false} onRow={this.handleProductGroupRowEvents}>
          <Table.Column<ProductGroup> key='name' title='Name' dataIndex='name' />
          <Table.Column<ProductGroup> key='shortName' title='Short Name' dataIndex='shortName' />
        </Table>
      </>
    );

  }

}

export default StockGroup;
