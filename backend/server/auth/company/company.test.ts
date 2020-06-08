/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import {CompanyModel} from './company.model';
import {AdminUserModel} from '../admin/admin.model';
import { Constants, AuthUris, CompanyS } from 'fivebyone';

const { HTTP_OK } = Constants;

describe(`${AuthUris.COMPANY_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';

  beforeAll(async() => {

    // Install admin user.
    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });

    await request(app).post(`${AuthUris.ADMIN_URI}`)
      .send(
        {
          email: 'manappaliPavithran@fiveByOne.com',
          name: 'Pavithram Manappalli',
          password: 'Simple_12@'
        }
      );

    const response = await request(app).post(`${AuthUris.ADMIN_URI}/login`)
      .send(
        {
          email: 'manappaliPavithran@fiveByOne.com',
          password: 'Simple_12@'
        }
      );

    serverToken = response.body.token;

  });

  afterAll(async() => {

    const AdminUser = AdminUserModel.createModel();
    AdminUser.remove({});
    await mongoose.disconnect();
    await mongod.stop();

  });

  afterEach(async() => {

    const Company = CompanyModel.createModel();
    await Company.remove({});

  });

  it('Should save a company with valid values.', async() => {

    const company: CompanyS = {
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
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(company);
    expect(response.status).toBe(HTTP_OK);

    const getCompanyData = await request(app).get(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(getCompanyData.status).toBe(HTTP_OK);
    expect(getCompanyData.body.name).toBe(company.name);


  });

  it('Should save a company with minimal values.', async() => {

    const companyInputJSON: any = {
      name: 'K and K Automobiles'
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);
    const company: any = validResponse.body;
    expect(company.name).toBe(companyInputJSON.name);

  });

});
