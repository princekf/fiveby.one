import React, { Component } from 'react';

/*
 * Import axios from 'axios';
 * import { getAuthHeaders } from '../../session';
 */
import { Form, Button, Col, Input, Row, Table, Select, Space, Popconfirm } from 'antd';

/*
 * Import './Style.scss';
 * import { Constants, ProductGroup } from 'fivebyone';
 * import { FormInstance } from 'antd/lib/form';
 */
const { Option } = Select;
// Const { HTTP_OK } = Constants;

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

export class CostCenter extends Component {

  private handleCostCenterDelete = () => {

    return (
      <>
      </>
    );

  }

  private handleCostCenterFormReset = () => {

    return (
      <>
      </>
    );

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

                /*
                 * FilterOption={(input, option) => {
                 *   return option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                 * }}
                 */
              >
                {/* {this.state.productGroups.map((productGroup) => {
                  return <Option key={productGroup._id} value={productGroup._id}>{productGroup.name}</Option>;
                }
                )} */}
                <Option value='option1'>option1</Option>
                <Option value='option2'>option1</Option>
                <Option value='option3'>option1</Option>
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
            title={'Are you sure delete the group Name'}
            okText='Yes'
            cancelText='No'
            onConfirm={this.handleCostCenterDelete}
            // Disabled={!this.state.selectedCostCenter._id}
          >
            <Button type='primary' htmlType='button' >
              Delete
            </Button>
          </Popconfirm>
          <Button type='primary' htmlType='reset' onClick={this.handleCostCenterFormReset}>
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
          {...layout}
          size='small'
          // OnFinish={this.handlePoductGroupUpdate}
        >
          {this.generateFormItemLayout()}
          {this.generateButtonLayout()}
        </Form>
        <Table/>
        {/* <Table<ProductGroup> dataSource={this.state.productGroupTree} size='small' key='_id'
          pagination={false} onRow={this.handleProductGroupRowEvents}>
          <Table.Column<ProductGroup> key='name' title='Name' dataIndex='name' />
          <Table.Column<ProductGroup> key='shortName' title='Short Name' dataIndex='shortName' />
        </Table> */}
      </>
    );

  }

}

export default CostCenter;
