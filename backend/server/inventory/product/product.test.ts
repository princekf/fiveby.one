/* eslint max-lines-per-function: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import User from '../../users/user.model';
import Product from './product.model';
import {Constants, Product as ProductEntity} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

describe('/api/inventory/products tests', () => {

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

    const product = new Product();
    product.group = 'Group Name';
    product.name = 'Product Name';
    product.code = 'Barcode';
    product.shortName = 'Short Name';
    product.brand = 'Brand Name';
    product.location = 'Location';
    product.barcode = 'HSN Code';
    product.unit = 'Unit';
    product.reorderLevel = 100;
    product.colors = [ 'red', 'white' ];
    product.hasBatch = true;
    await product.save();

  });

  // Remove sample items
  afterEach(async() => {

    await Product.remove({});

  });

  it('should get products', async() => {

    const response = await request(app).get('/api/inventory/products')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_OK);
    const listedProducts: ProductEntity[] = response.body;
    expect(listedProducts.length).toEqual(1);
    expect(listedProducts).toEqual([
      expect.objectContaining({
        group: 'Group Name',
        name: 'Product Name',
        code: 'Barcode',
        shortName: 'Short Name',
        brand: 'Brand Name',
        location: 'Location',
        barcode: 'HSN Code',
        unit: 'Unit',
        reorderLevel: 100,
        colors: [ 'red', 'white' ],
        hasBatch: true
      }),
    ]);

  });

  it('should post products', async() => {

    const response = await request(app).post('/api/inventory/products')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: 'Group Name 2',
        name: 'Product Name 2',
        code: 'Barcode 2',
        shortName: 'Short Name 2',
        brand: 'Brand Name 2',
        location: 'Location 2',
        barcode: 'HSN Code 2',
        unit: 'Unit 2',
        reorderLevel: 100,
        colors: [ 'blue', 'black' ],
        hasBatch: true
      });
    expect(response.status).toBe(HTTP_OK);
    const savedProduct: ProductEntity = response.body;
    const idMinLength = 2;
    expect(savedProduct._id.length > idMinLength).toBe(true);
    expect(savedProduct).toEqual(
      expect.objectContaining({
        group: 'Group Name 2',
        name: 'Product Name 2',
        code: 'Barcode 2',
        shortName: 'Short Name 2',
        brand: 'Brand Name 2',
        location: 'Location 2',
        barcode: 'HSN Code 2',
        unit: 'Unit 2',
        reorderLevel: 100,
        colors: [ 'blue', 'black' ],
        hasBatch: true
      }),
    );

  });

  it('should catch errors when posting products', async() => {

    const response = await request(app).post('/api/inventory/products')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({});
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('cant save product because group cant be empty', async() => {

    const response = await request(app).post('/api/inventory/products')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: '',
        name: 'Product Name 2',
        code: 'Barcode 2',
        shortName: 'Short Name 2',
        brand: 'Brand Name 2',
        location: 'Location 2',
        barcode: 'HSN Code 2',
        unit: 'Unit 2',
        reorderLevel: 100,
        colors: [ 'blue', 'black' ],
        hasBatch: true
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('cant save product because group is required', async() => {

    const response = await request(app).post('/api/inventory/products')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Name 2',
        code: 'Barcode 2',
        shortName: 'Short Name 2',
        brand: 'Brand Name 2',
        location: 'Location 2',
        barcode: 'HSN Code 2',
        unit: 'Unit 2',
        reorderLevel: 100,
        colors: [ 'blue', 'black' ],
        hasBatch: true
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('cant save product because name cant be empty', async() => {

    const response = await request(app).post('/api/inventory/products')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: 'Group Name 2',
        name: '',
        code: 'Barcode 2',
        shortName: 'Short Name 2',
        brand: 'Brand Name 2',
        location: 'Location 2',
        barcode: 'HSN Code 2',
        unit: 'Unit 2',
        reorderLevel: 100,
        colors: [ 'blue', 'black' ],
        hasBatch: true
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('cant save product because name is required', async() => {

    const response = await request(app).post('/api/inventory/products')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: 'Group Name 2',
        code: 'Barcode 2',
        shortName: 'Short Name 2',
        brand: 'Brand Name 2',
        location: 'Location 2',
        barcode: 'HSN Code 2',
        unit: 'Unit 2',
        reorderLevel: 100,
        colors: [ 'blue', 'black' ],
        hasBatch: true
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

});
