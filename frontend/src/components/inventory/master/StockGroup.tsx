import React, { Component } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../../session';
import { Form, Button, Col, Input, Row, Table, AutoComplete, Select, Space, message } from 'antd';
import './Style.scss';
import { Constants, ProductGroup, ProductGroupS } from 'fivebyone';
const { Option } = Select;
const { HTTP_OK } = Constants;

interface ProductGroupTree extends ProductGroup{
  children: ProductGroup[];
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


interface ProductGroupState {
  productGroups: ProductGroup[];
}


export class StockGroup extends Component<ProductGroupState, {}> {

  productGroups: ProductGroup[] = [];
  productGroupMap:any = {};
  productGroupTree:any = [];

  state = {
    productGroups: new Array<ProductGroup>(),
    productGroupTree:  [],
  }

  private handlePoductGroupUpdate = async (values: any): Promise<void> => {
    const hideLodingMessage = message.loading('Updating product into server...');
    const ERROR_MESSAGE_DISPLAY_TIME = 5;
    try {

      const response = await axios.post<ProductGroup>('/api/inventory/productgroup', values, { headers: getAuthHeaders() });
      if (response.status !== HTTP_OK) {

        message.error('Product group update failes, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

      }

      const productGroup: ProductGroup = response.data;
      const selectedProductGroup = this.state.productGroups.find(prdGroup => prdGroup._id === productGroup._id);
      if (!selectedProductGroup) {
        this.productGroups.push(productGroup)
        this.setState({ productGroups: [...this.productGroups] });
      }

    } catch (error) {

      message.error('Product group update failes, pelase try again', ERROR_MESSAGE_DISPLAY_TIME);

    } finally {

      hideLodingMessage();

    }
  };

  private handleParentGroupSearch = (value: string): void => {
    const lValue = value.toLowerCase();
    const filteredProductGroups: ProductGroup[] = this.productGroups.filter(prdGrp => prdGrp.name.toLowerCase().indexOf(lValue) !== -1);

    this.setState({ productGroups: [...filteredProductGroups] });
  };

  
  private handleProductGroupRowEvents = (record:any, _rowIndex:any):any =>{
    return {onClick: async () => {
      const response = await axios.get<ProductGroup>(`/api/inventory/productgroup/${record._id}`, { headers: getAuthHeaders() });
      const productGroup = response.data;
    }}
  };

  async componentDidMount() {
    const response = await axios.get<ProductGroup[]>('/api/inventory/productgroup', { headers: getAuthHeaders() });
    const productGroups = response.data;
    this.productGroups = productGroups;
    productGroups.forEach((item:ProductGroup, _index) => {
      if(!this.productGroupMap[item._id]){
        this.productGroupMap[item._id] = {}
      }
      this.productGroupMap[item._id]['key'] = item._id;
      this.productGroupMap[item._id]['_id'] = item._id;
      this.productGroupMap[item._id]['name'] = item.name;
      this.productGroupMap[item._id]['shortName'] = item.shortName;
      if(item.parent){
        if(!this.productGroupMap[item.parent._id]){
          this.productGroupMap[item.parent._id] = {}
        }
        if(!this.productGroupMap[item.parent._id].children){
          this.productGroupMap[item.parent._id].children = [];
        }
        
        this.productGroupMap[item.parent._id].children.push(this.productGroupMap[item._id]);
      }else{
        this.productGroupTree.push(this.productGroupMap[item._id]);
      }
    });
    console.log(this.productGroupTree);
    
    this.setState({ productGroups: [...this.productGroups] });
    this.setState({ productGroupTree: [...this.productGroupTree] });
  }

  render() {

    return (
      <>
        <Form
          {...layout}
          size='small'
          onFinish={this.handlePoductGroupUpdate}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name='name'
                label='Name'
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
                <Select showSearch={true}
                  filterOption={(input, option) => option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {this.state.productGroups.map(productGroup => (
                    <Option key={productGroup._id} value={productGroup._id}>{productGroup.name}</Option>
                  ))}
                </Select>
              </Form.Item>

            </Col>


          </Row>
          <Form.Item {...tailLayout}>
            <Space size='large'>
              <Button type='primary' htmlType='submit'>
                Submit
            </Button>

              <Button type='primary' htmlType='button'>
                Delete
            </Button>
              <Button type='primary' htmlType='reset'>
                Reset
            </Button>
            </Space>
          </Form.Item>
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
