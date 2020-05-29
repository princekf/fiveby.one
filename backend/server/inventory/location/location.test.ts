/* eslint {max-lines-per-function: 0, max-statements:0} */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import User from '../../auth/user/user.model';
import Product from '../product/product.model';
import ProductGroup from '../productGroup/productGroup.model';
import {Constants, ProductGroup as ProductGroupEntity, AuthUris} from 'fivebyone';

const {HTTP_OK} = Constants;

describe('/api/inventory/location tests', () => {

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
    user.name = 'Test User';
    user.setPassword('Simple_123@');
    await user.save();
    const response = await request(app).post(`${AuthUris.USER_URI}/login`)
      .send({
        email: 'test@email.com',
        password: 'Simple_123@',
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

  beforeEach(async() => {

    await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group',
        shortName: 'PG',
      });

  });

  // Remove sample items
  afterEach(async() => {

    await Product.remove({});
    await ProductGroup.remove({});

  });

  it('Should list locations', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product One',
        code: 'Code One',
        location: 'FBO One',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product Two',
        code: 'Code Two',
        location: 'FBO Two',
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).get('/api/inventory/location')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const locations: string[] = response3.body;
    const locationsLength = 2;
    expect(locations.length).toBe(locationsLength);
    expect(locations[0]).toBe('FBO One');
    expect(locations[1]).toBe('FBO Two');

  });


  it('Should list only distinct locations', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product One',
        code: 'Code One',
        location: 'FBO One',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product Two',
        code: 'Code Two',
        location: 'FBO Two',
      });
    expect(response2.status).toBe(HTTP_OK);

    const response4 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product Three',
        code: 'Code Three',
        location: 'FBO One',
      });
    expect(response4.status).toBe(HTTP_OK);

    const response3 = await request(app).get('/api/inventory/location')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const locations: string[] = response3.body;
    const locationsLength = 2;
    expect(locations.length).toBe(locationsLength);
    expect(locations[0]).toBe('FBO One');
    expect(locations[1]).toBe('FBO Two');

  });

  it('Should list empty if no products', async() => {

    const response3 = await request(app).get('/api/inventory/location')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const locations: string[] = response3.body;
    expect(locations.length).toBe(0);

  });

  it('Should list empty if no locations', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product One',
        code: 'Code One',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product Two',
        code: 'Code Two',
      });
    expect(response2.status).toBe(HTTP_OK);

    const response4 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product Three',
        code: 'Code Three',
      });
    expect(response4.status).toBe(HTTP_OK);

    const response3 = await request(app).get('/api/inventory/location')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const locations: string[] = response3.body;
    expect(locations.length).toBe(0);

  });

});
