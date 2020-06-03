/* eslint {max-lines-per-function: 0, max-statements:0} */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import User from '../../auth/user/user.model';
import Product from '../product/product.model';
import ProductGroup from '../productGroup/productGroup.model';
import Company from '../../auth/company/company.model';
import {Constants, ProductGroup as ProductGroupEntity, AuthUris, CompanyS as CompanyI} from 'fivebyone';

const {HTTP_OK} = Constants;
const companyInputJSON: CompanyI = {
  name: 'Mercedes Benz',
  email: 'care@diamler.org',
  addressLine1: 'Annai Nagar',
  addressLine2: 'MGR Street',
  addressLine3: 'Near Bakery road',
  addressLine4: 'Chennai',
  state: 'Tamil Nadu',
  country: 'India',
  pincode: '223344',
  contact: '9656444108',
  phone: '7907919930',
};

describe('/api/inventory/brand tests', () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';
  const createTestUser = async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });
    const company = new Company(companyInputJSON);
    await company.save();
    const companyRes = await Company.findOne({ name: companyInputJSON.name });
    await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    const user = new User();
    user.email = 'test@email.com';
    user.name = 'Test User';
    user.company = companyRes;
    user.setPassword('Simple_123@');
    await user.save();

  };

  // Connect to mongoose mock, create a test user and get the access token
  beforeAll(async() => {

    await createTestUser();
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

  it('Should list brands', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product One',
        code: 'Code One',
        brand: 'FBO One',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product Two',
        code: 'Code Two',
        brand: 'FBO Two',
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).get('/api/inventory/brand')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const brands: string[] = response3.body;
    const brandsLength = 2;
    expect(brands.length).toBe(brandsLength);
    expect(brands[0]).toBe('FBO One');
    expect(brands[1]).toBe('FBO Two');

  });


  it('Should list only distinct brands', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product One',
        code: 'Code One',
        brand: 'FBO One',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product Two',
        code: 'Code Two',
        brand: 'FBO Two',
      });
    expect(response2.status).toBe(HTTP_OK);

    const response4 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product Three',
        code: 'Code Three',
        brand: 'FBO One',
      });
    expect(response4.status).toBe(HTTP_OK);

    const response3 = await request(app).get('/api/inventory/brand')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const brands: string[] = response3.body;
    const brandsLength = 2;
    expect(brands.length).toBe(brandsLength);
    expect(brands[0]).toBe('FBO One');
    expect(brands[1]).toBe('FBO Two');

  });

  it('Should list empty if no products', async() => {

    const response3 = await request(app).get('/api/inventory/brand')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const brands: string[] = response3.body;
    expect(brands.length).toBe(0);

  });

  it('Should list empty if no brands', async() => {

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

    const response3 = await request(app).get('/api/inventory/brand')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const brands: string[] = response3.body;
    expect(brands.length).toBe(0);

  });

});
