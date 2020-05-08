/* eslint max-lines-per-function: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import User from '../../users/user.model';
import ProductGroup from './productGroup.model';
import {Constants, ProductGroup as ProductGroupEntity} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

describe('/api/inventory/productgroups tests', () => {
  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';

  // Connect to mongoose mock, create a test user and get the access token
  beforeAll(async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });
    const user = new User();
    user.email = 'test@email.com';
    user.setPassword('test-password');
    await user.save();
    const response = await request(app).post('/api/users/login')
      .send({
        email: 'test@email.com',
        password: 'test-password',
      });
    const {body: {token}} = response;
    serverToken = token;

  });

  // Remove test user, disconnect and stop database
  afterAll(async() => {

    await User.remove({});
    await mongoose.disconnect();
    await mongod.stop();

  });
  // Create a sample item
  beforeEach(async() => {

    // const productGroup = new ProductGroup();
    // productGroup.name = 'Product Group Name';
    // productGroup.shortName = 'Short Name';
    // await productGroup.save();

  });

  // Remove sample items
  afterEach(async() => {

    await ProductGroup.remove({});

  });



  it('should post productGroups', async() => {

    const response = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
        parent: '',
      });
    expect(response.status).toBe(HTTP_OK);
    const savedProductGroup: ProductGroupEntity = response.body;
    const idMinLength = 2;
    expect(savedProductGroup._id.length > idMinLength).toBe(true);
    expect(savedProductGroup).toEqual(
      expect.objectContaining({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
        parent: '',
      }),
    );

  });

  it('should catch errors when posting productgroups', async() => {

    const response = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({});
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('cant save productGroup because name cant be empty', async() => {

    const response = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: '',
        shortName: 'Short Name 2',
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('cant save productGroup because name is required', async() => {

    const response = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        shortName: 'Short Name 2',
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('cant save productGroup if parent group is invalid', async() => {

    const response = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 2',
        shortName: 'Short Name 2',
        parent: 'Invalid Group Parent',
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('should save productGroup if valid parent', async() => {

    const response1 = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 1',
        shortName: 'Short Name 1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup1: ProductGroupEntity = response1.body;
    // level one parent
    const response2 = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 2',
        shortName: 'Short Name 2',
        parent: savedProductGroup1._id,
      });
    expect(response2.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = response2.body;
    expect(savedProductGroup2).toEqual(
      expect.objectContaining({
        name: 'Group Name 2',
        shortName: 'Short Name 2',
        parent: savedProductGroup1._id,
        ancestors:[savedProductGroup1._id]
      }),
    );
    // level two parent
    const response3 = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 3',
        shortName: 'Short Name 3',
        parent: savedProductGroup2._id,
      });
    expect(response3.status).toBe(HTTP_OK);
    const savedProductGroup3: ProductGroupEntity = response3.body;
    expect(savedProductGroup3).toEqual(
      expect.objectContaining({
        name: 'Group Name 3',
        shortName: 'Short Name 3',
        parent: savedProductGroup2._id,
        ancestors:[savedProductGroup1._id, savedProductGroup2._id]
      }),
    );
  });
  
  it('should get productGroups', async() => {
    const response1 = await request(app).post('/api/inventory/productgroup')
    .set('Authorization', `Bearer ${serverToken}`)
    .send({
      name: 'Product Group Name',
      shortName: 'Short Name',
      parent: '',
    });
  expect(response1.status).toBe(HTTP_OK);
    const response = await request(app).get('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_OK);
    const listedProductGroups: ProductGroupEntity[] = response.body;
    expect(listedProductGroups.length).toEqual(1);
    expect(listedProductGroups).toEqual([
      expect.objectContaining({
        name: 'Product Group Name',
        shortName: 'Short Name',
        parent: '',
        ancestors:[],
      }),
    ]);

  });

  it('should get productGroup by id', async() => {

    const response = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
        parent: '',
      });
    expect(response.status).toBe(HTTP_OK);
    const savedProductGroup: ProductGroupEntity = response.body;
    const response2 = await request(app).get(`/api/inventory/productgroup/${savedProductGroup._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = response2.body;
    expect(savedProductGroup2).toEqual(
      expect.objectContaining({
        _id: savedProductGroup._id,
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
        parent: '',
        ancestors:[],
      }),
    );
  });

  it('should not return productGroup with invalid id', async() => {
    const response = await request(app).get(`/api/inventory/productgroup/0987654`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
  });

  it('Should update product group', async() => {
    const response1 = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-1',
        shortName: 'Short Name 1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup1: ProductGroupEntity = response1.body;
    savedProductGroup1.name = 'Name-1';
    const response2 = await request(app).put(`/api/inventory/productgroup/${savedProductGroup1._id}`)
    .set('Authorization', `Bearer ${serverToken}`)
      .send(savedProductGroup1);
    expect(response2.status).toBe(HTTP_OK);
    expect(response2.body).toEqual('Product group updated successfully.');
    const response3 = await request(app).get(`/api/inventory/productgroup/${savedProductGroup1._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = response3.body;
    expect(savedProductGroup2).toEqual(
      expect.objectContaining({
        _id: savedProductGroup1._id,
        name: 'Name-1',
        shortName: 'Short Name 1',
        ancestors:[],
      }),
    );
  });

  it('Should update product group with parent', async() => {
    const response1 = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup1: ProductGroupEntity = response1.body;

    const response2 = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-2',
      });
    expect(response2.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = response2.body;

    const response3 = await request(app).put(`/api/inventory/productgroup/${savedProductGroup1._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 1',
        parent: savedProductGroup2._id,
      });
    expect(response3.status).toBe(HTTP_OK);

  const response4 = await request(app).get(`/api/inventory/productgroup/${savedProductGroup1._id}`)
    .set('Authorization', `Bearer ${serverToken}`);
  expect(response4.status).toBe(HTTP_OK);
    const savedProductGroup4: ProductGroupEntity = response4.body;
    expect(savedProductGroup4).toEqual(
      expect.objectContaining({
        _id: savedProductGroup1._id,
        name: 'Group Name 1',
        parent: savedProductGroup2._id,
        ancestors:[savedProductGroup2._id],
      }),
    );
  });

  it('cant update productGroup if there is circular relation with parent', async() => {

    const response1 = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup1: ProductGroupEntity = response1.body;
    
    const response2 = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-2',
        parent: savedProductGroup1._id,
      });
    expect(response2.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = response2.body;

    const response3 = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-3',
        parent: savedProductGroup2._id,
      });
    expect(response3.status).toBe(HTTP_OK);
    const savedProductGroup3: ProductGroupEntity = response3.body;

    const response4 = await request(app).put(`/api/inventory/productgroup/${savedProductGroup1._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-1',
        parent: savedProductGroup3._id,
      });
    expect(response4.status).toBe(HTTP_BAD_REQUEST);

  });

  it('should delete productGroups', async() => {

    const response = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
        parent: '',
      });
    expect(response.status).toBe(HTTP_OK);
    const savedProductGroup: ProductGroupEntity = response.body;

    const response3 = await request(app).delete(`/api/inventory/productgroup/${savedProductGroup._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);

    const response4 = await request(app).get(`/api/inventory/productgroup/${savedProductGroup._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_BAD_REQUEST);

  });

  it('should handle delete of invalid productGroups', async() => {

    const response3 = await request(app).delete(`/api/inventory/productgroup/09876`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

});