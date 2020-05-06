import React, { Component } from 'react';
import { Button, Col, Input, Row, Table } from 'antd';
import './Style.scss';

const { TextArea } = Input;

const dataSource = [
  {
    key: '1',
    name: 'Classmate Note book 100p',
    shortName: 'Book',
    description: 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also th'
  },
  {
    key: '2',
    name: 'Classmate Note book 100p',
    shortName: 'Book',
    description: 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also th'
  },
  {
    key: '3',
    name: 'Classmate Note book 100p',
    shortName: 'Book',
    description: 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also th'
  },

];

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: '20%',
  },
  {
    title: 'Short Name',
    dataIndex: 'shortName',
    key: 'shortName',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
];

export class PriceType extends Component {

  render() {

    return (
      <div>
        <Row style={{ display: 'flex'}}>
          <Col span={24} style={{ margin: 'auto',
            maxWidth: '600px'}}>
            <Col className='box'>
              <h4 className='text'>Name</h4>
              <Input placeholder='Name'/>
            </Col>
            <Col className='box'>
              <h4 className='text'>Short Name</h4>
              <Input placeholder='Short Name'/>
            </Col>
            <Col className='box'>
              <h4 className='text'>Description</h4>
              <TextArea/>
            </Col>
            <Col className='box'>
              <Button className='button' type='primary'>Clear</Button>
              <Button className='button' type='primary'>Reset</Button>
              <Button className='button' type='primary'>Submit</Button>
            </Col>

          </Col>
          <Col span={24}>
            <Table
              dataSource={dataSource}
              columns={columns}
              scroll={{ y: 240 }}
              pagination={{
                total: dataSource.length,
                pageSize: dataSource.length,
                hideOnSinglePage: true,
              }}
            />
          </Col>
        </Row>
      </div>
    );

  }

}

export default PriceType;
