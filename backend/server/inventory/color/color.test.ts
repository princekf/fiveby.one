/* eslint {max-lines-per-function: 0, max-statements:0} */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import User from '../../auth/user/user.model';
import Product from '../product/product.model';
import ProductGroup from '../productGroup/productGroup.model';
import Company from '../../auth/company/company.model';
import CompanyBranchM from '../../auth/companyBranch/companyBranch.model';
import {Constants, ProductGroup as ProductGroupEntity, AuthUris, CompanyS as CompanyI, CompanyBranchS, CompanyBranch} from 'fivebyone';

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
const companyBranchInput: CompanyBranchS = {
  company: null,
  name: null,
  addressLine1: 'Panvel - Kochi - Kanyakumari Highway',
  addressLine2: 'Vikas Nagar',
  addressLine3: 'Maradu',
  addressLine4: 'Ernakulam',
  contact: '7907919930',
  phone: '9656444108',
  email: 'contactUs@rajasreeKochi.com',
  state: 'Kerala',
  country: 'India',
  pincode: '685588',
  finYears: [ {
    name: '2019-20',
    startDate: '2019-02-01',
    endDate: '2020-02-01'
  } ]
};

describe('/api/inventory/color tests', () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';

  const createCompanyBranch = async(companyBrInput: CompanyBranchS): Promise<CompanyBranch> => {

    const companyBranch = new CompanyBranchM(companyBrInput);
    await companyBranch.save();
    const companyBranchEntity: CompanyBranch = await CompanyBranchM.findOne({ name: companyBranch.name });
    return companyBranchEntity;

  };


  // Connect to mongoose mock, create a test user and get the access token
  beforeAll(async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });
    const company = new Company(companyInputJSON);
    await company.save();
    const user = new User();
    user.email = 'test@email.com';
    user.name = 'Test User';
    user.company = company;
    companyBranchInput.company = company;
    companyBranchInput.name = 'five.byOne';
    const companyBranch = await createCompanyBranch(companyBranchInput);
    user.companyBranches = [ companyBranch ];
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

  it('Should list colors', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product One',
        code: 'Code One',
        colors: [ 'Black', 'White' ],
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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


  it('Should list only distinct colors', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product One',
        code: 'Code One',
        colors: [ 'Black', 'White' ],
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product Two',
        code: 'Code Two',
        colors: [ 'Red', 'Green' ],
      });
    expect(response2.status).toBe(HTTP_OK);

    const response4 = await request(app).post('/api/inventory/product')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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

    const response3 = await request(app).get('/api/inventory/color')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);

    const colors: string[] = response3.body;
    expect(colors.length).toBe(0);

  });

});
