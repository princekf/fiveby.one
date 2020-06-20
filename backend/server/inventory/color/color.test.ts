/* eslint {max-lines-per-function: 0, max-statements:0} */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import {UserModel} from '../../auth/user/user.model';
import {ProductModel} from '../product/product.model';
import {ProductGroupModel} from '../productGroup/productGroup.model';
import {Constants, ProductGroup as ProductGroupEntity, AuthUris, CompanyS as CompanyI} from 'fivebyone';

const {HTTP_OK, HTTP_UNAUTHORIZED} = Constants;
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
const userJson: any = {
  name: 'John Honai',
  mobile: '+91123456789',
  email: 'john.honai@fivebyOne.com',
  password: 'Simple_123@',
  addressLine1: 'Jawahar Nagar',
  addressLine2: 'TTC',
  addressLine3: 'Vellayambalam',
  addressLine4: 'Museum',
  state: 'Kerala',
  country: 'India',
  pinCode: '223344',
};

describe('/api/inventory/color tests', () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';
  let serverTokenAdmin = '';
  let companyDetails: any;
  let producdGroupData: ProductGroupEntity;


  const createTestAdmin = async() => {

    const user = {
      email: 'pshaji@fivebyone.com',
      password: 'Simple_12@',
      name: 'Pashanam Shaji',
      mobile: '+919234567887'
    };
    const response = await request(app).post(`${AuthUris.ADMIN_URI}`)
      .send(user);
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post(`${AuthUris.ADMIN_URI}/login`)
      .send({
        email: 'pshaji@fivebyone.com',
        password: 'Simple_12@',
      });
    expect(response2.status).toBe(HTTP_OK);
    serverTokenAdmin = response2.body.token;

  };


  const createTestUser = async() => {

    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverTokenAdmin}`)
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const companyData = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverTokenAdmin}`)
      .send({
        name: 'K and K automobiles',
        email: 'manoharn@kAndK.com',
        addressLine1: 'Annai Nagar',
        addressLine2: 'MGR Street',
        addressLine3: 'Near Bakery road',
        addressLine4: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        pincode: '223344',
        contact: '9656444108',
        phone: '7907919930'
      });
    companyDetails = companyData.body;
    const response2 = await request(app).post(`${AuthUris.USER_URI}/user/admin/${companyDetails._id}`)
      .set('Authorization', `Bearer ${serverTokenAdmin}`)
      .send(userJson);
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).post(`${AuthUris.USER_URI}/${companyDetails.code}/login`)
      .send({
        email: 'john.honai@fivebyOne.com',
        password: 'Simple_123@',
      });
    expect(response3.status).toBe(HTTP_OK);
    serverToken = response3.body.token;

  };


  // Connect to mongoose mock, create a test user and get the access token
  beforeAll(async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });

    await createTestAdmin();
    await createTestUser();

  });

  // Remove test user, disconnect and stop database
  afterAll(async() => {

    const User = UserModel.createModel(companyDetails.code);
    await User.remove({});
    await mongoose.disconnect();
    await mongod.stop();

  });

  beforeEach(async() => {

    const response = await request(app).post('/api/inventory/productgroup')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group',
        shortName: 'PG',
      });
    expect(response.status).toBe(HTTP_OK);
    producdGroupData = response.body;

  });

  // Remove sample items
  afterEach(async() => {

    const ProductGroup = ProductGroupModel.createModel(companyDetails.code);
    const Product = ProductModel.createModel(companyDetails.code);
    await Product.remove({});
    await ProductGroup.remove({});

  });

  it('Should list colors', async() => {

    const response = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: producdGroupData,
        name: 'Product One',
        code: 'Code One',
        colors: [ 'Black', 'White' ],
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: producdGroupData,
        name: 'Product Two',
        code: 'Code Two',
        colors: [ 'Red', 'Green' ],
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).get('/api/inventory/color')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const colors: string[] = response3.body;
    const colorsSort = colors.sort();
    const colorsLength = 4;
    expect(colors.length).toBe(colorsLength);
    expect(colorsSort[0]).toBe('Black');
    expect(colorsSort[1]).toBe('Green');
    expect(colorsSort[2]).toBe('Red');
    expect(colorsSort[3]).toBe('White');

  });

  it('Should not list colors with invaild token', async() => {

    const response = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: producdGroupData,
        name: 'Product One',
        code: 'Code One',
        colors: [ 'Black', 'White' ],
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: producdGroupData,
        name: 'Product Two',
        code: 'Code Two',
        colors: [ 'Red', 'Green' ],
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).get('/api/inventory/color')
      .set('Authorization', `Bearer2 ${serverToken}`);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not list colors without token', async() => {

    const response = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: producdGroupData,
        name: 'Product One',
        code: 'Code One',
        colors: [ 'Black', 'White' ],
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: producdGroupData,
        name: 'Product Two',
        code: 'Code Two',
        colors: [ 'Red', 'Green' ],
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).get('/api/inventory/color');
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });


  it('Should list only distinct colors', async() => {

    const response = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: producdGroupData,
        name: 'Product One',
        code: 'Code One',
        colors: [ 'Black', 'White' ],
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: producdGroupData,
        name: 'Product Two',
        code: 'Code Two',
        colors: [ 'Red', 'Green' ],
      });
    expect(response2.status).toBe(HTTP_OK);

    const response4 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: producdGroupData,
        name: 'Product Three',
        code: 'Code Three',
        colors: [ 'Red', 'Black' ],
      });
    expect(response4.status).toBe(HTTP_OK);

    const response3 = await request(app).get('/api/inventory/color')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const colors: string[] = response3.body;
    const colorsSort = colors.sort();
    const colorsLength = 4;
    expect(colors.length).toBe(colorsLength);
    expect(colorsSort[0]).toBe('Black');
    expect(colorsSort[1]).toBe('Green');
    expect(colorsSort[2]).toBe('Red');
    expect(colorsSort[3]).toBe('White');

  });

  it('Should list empty if no products', async() => {

    const response3 = await request(app).get('/api/inventory/color')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const colors: string[] = response3.body;
    expect(colors.length).toBe(0);

  });

  it('Should list empty if no colors', async() => {

    const response = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: producdGroupData,
        name: 'Product One',
        code: 'Code One',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: producdGroupData,
        name: 'Product Two',
        code: 'Code Two',
      });
    expect(response2.status).toBe(HTTP_OK);

    const response4 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: producdGroupData,
        name: 'Product Three',
        code: 'Code Three',
      });
    expect(response4.status).toBe(HTTP_OK);

    const response3 = await request(app).get('/api/inventory/color')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);

    const colors: string[] = response3.body;
    expect(colors.length).toBe(0);

  });

});
