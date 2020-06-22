/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import { CompanyModel } from './company.model';
import { AdminUserModel } from '../admin/admin.model';
import { Constants, AuthUris, CompanyS, Company } from 'fivebyone';

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;

describe(`${AuthUris.COMPANY_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';

  beforeAll(async() => {

    // Install admin user.
    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
    await AdminUser.deleteMany({});
    await mongoose.disconnect();
    await mongod.stop();

  });

  afterEach(async() => {

    const CompanySchema = CompanyModel.createModel();
    await CompanySchema.deleteMany({});

  });

  it('SHOULD SAVE :  company with valid values.', async() => {

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

    const response2 = await request(app).get(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const companyResp: Company = response2.body;
    expect(company.name).toBe(companyResp.name);
    expect(company.email).toBe(companyResp.email);
    expect(company.addressLine1).toBe(companyResp.addressLine1);
    expect(company.addressLine2).toBe(companyResp.addressLine2);
    expect(company.addressLine3).toBe(companyResp.addressLine3);
    expect(company.addressLine4).toBe(companyResp.addressLine4);
    expect(company.state).toBe(companyResp.state);
    expect(company.country).toBe(companyResp.country);
    expect(company.pincode).toBe(companyResp.pincode);
    expect(company.contact).toBe(companyResp.contact);
    expect(companyResp).toHaveProperty('code');

  });

  it('SHOULD NOT SAVE :  with invalid user token.', async() => {

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
      .set('Authorization', `Bearer2 ${serverToken}`)
      .send(company);
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT SAVE :  without user token.', async() => {

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
      .send(company);
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD SAVE :  company with minimal values.', async() => {

    const company: any = {
      name: 'K and K Automobiles'
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(company);
    expect(response.status).toBe(HTTP_OK);

    const companyRes = await request(app).get(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(companyRes.status).toBe(HTTP_OK);
    const companyData: Company = companyRes.body;
    expect(company.name).toBe(companyData.name);
    expect(companyData).toHaveProperty('code');

  });

  it('SHOULD NOT SAVE :  company - Name required.', async() => {

    // Name empty company input
    const company1: CompanyS = {
      name: '  ',
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
    const response2 = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(company1);
    expect(response2.status).toBe(HTTP_BAD_REQUEST);
    // No name company input
    const company2: any = {
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
      .send(company2);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT SAVE :  company - invalid email Id', async() => {

    const companyInputJSON: CompanyS = {
      name: 'K and K Automobiles',
      email: 'contact@manoharn',
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
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT SAVE :  company - invalid  contact Number', async() => {

    const companyInputJSON: CompanyS = {
      name: 'K and K Automobiles',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Annai Nagar',
      addressLine2: 'MGR Street',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '223344',
      contact: '322',
      phone: '7907919930'
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT SAVE :  company - invalid  Phone Number', async() => {

    const companyInputJSON: CompanyS = {
      name: 'K and K Automobiles',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Annai Nagar',
      addressLine2: 'MGR Street',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '223344',
      contact: '7907919930',
      phone: '5645'
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT SAVE :  company - email Id has to be unique', async() => {

    const companyInputJSON: CompanyS = {
      name: 'K and K Automobiles',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Annai Nagar',
      addressLine2: 'MGR Street',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '223344',
      contact: '7907919930',
      phone: '9656444108'
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const otherCompanyInput: CompanyS = {
      name: 'pachalam bhasi Drama school',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Vasavi Nagar',
      addressLine2: 'Sira road',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '223344',
      contact: '7755885522',
      phone: '1234567890'
    };
    const otherCompanyResponse = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(otherCompanyInput);
    expect(otherCompanyResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: Create a Company and update the fields of the company-valid values', async() => {

    const companyInputJSON: CompanyS = {
      name: 'K and K Automobiles',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Annai Nagar',
      addressLine2: 'MGR Street',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '223344',
      contact: '7907919930',
      phone: '9656444108'
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const updateCompanyFields: CompanyS = {
      name: 'pachalam bhasi Drama school',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Vasavi Nagar',
      addressLine2: 'Sira road',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'TAMIL NADU',
      country: 'BHARATHAM',
      pincode: '112255',
      contact: '1234567890',
      phone: '9874563210'
    };
    const updateCompanyResponse = await request(app).put(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updateCompanyFields);
    expect(updateCompanyResponse.status).toBe(HTTP_OK);

    const getCompanyResponse = await request(app).get(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updateCompanyFields);
    expect(getCompanyResponse.status).toBe(HTTP_OK);

    const getCompanyData: CompanyS = getCompanyResponse.body;

    expect(getCompanyData.name).toBe(updateCompanyFields.name);
    expect(getCompanyData.email).toBe(updateCompanyFields.email);

    expect(getCompanyData.phone).toBe(updateCompanyFields.phone);
    expect(getCompanyData.contact).toBe(updateCompanyFields.contact);

    expect(getCompanyData.state).toBe(updateCompanyFields.state);
    expect(getCompanyData.country).toBe(updateCompanyFields.country);

    expect(getCompanyData.addressLine1).toBe(updateCompanyFields.addressLine1);
    expect(getCompanyData.addressLine2).toBe(updateCompanyFields.addressLine2);
    expect(getCompanyData.addressLine3).toBe(updateCompanyFields.addressLine3);
    expect(getCompanyData.addressLine4).toBe(updateCompanyFields.addressLine4);

    expect(getCompanyData.pincode).toBe(updateCompanyFields.pincode);
    expect(getCompanyData).toHaveProperty('code');

  });

  it('SHOULD NOT: Update a company without user token', async() => {

    const companyInputJSON: CompanyS = {
      name: 'K and K Automobiles',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Annai Nagar',
      addressLine2: 'MGR Street',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '223344',
      contact: '7907919930',
      phone: '9656444108'
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const updateCompanyFields: CompanyS = {
      name: 'pachalam bhasi Drama school',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Vasavi Nagar',
      addressLine2: 'Sira road',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'TAMIL NADU',
      country: 'BHARATHAM',
      pincode: '112255',
      contact: '1234567890',
      phone: '9874563210'
    };
    const updateCompanyResponse = await request(app).put(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .send(updateCompanyFields);
    expect(updateCompanyResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: Update a company with an invalid user token', async() => {

    const companyInputJSON: CompanyS = {
      name: 'K and K Automobiles',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Annai Nagar',
      addressLine2: 'MGR Street',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '223344',
      contact: '7907919930',
      phone: '9656444108'
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const updateCompanyFields: CompanyS = {
      name: 'pachalam bhasi Drama school',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Vasavi Nagar',
      addressLine2: 'Sira road',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'TAMIL NADU',
      country: 'BHARATHAM',
      pincode: '112255',
      contact: '1234567890',
      phone: '9874563210'
    };
    const updateCompanyResponse = await request(app).put(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer2 ${serverToken}`)
      .send(updateCompanyFields);
    expect(updateCompanyResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD: Send  bad request if the body is empty for an update', async() => {

    const companyInputJSON: CompanyS = {
      name: 'K and K Automobiles',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Annai Nagar',
      addressLine2: 'MGR Street',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '223344',
      contact: '7907919930',
      phone: '9656444108'
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const updateCompanyResponse = await request(app).put(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({});
    expect(updateCompanyResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD : Send  bad request for  request to update without body', async() => {

    const companyInputJSON: CompanyS = {
      name: 'K and K Automobiles',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Annai Nagar',
      addressLine2: 'MGR Street',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '223344',
      contact: '7907919930',
      phone: '9656444108'
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const updateCompanyResponse = await request(app).put(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(updateCompanyResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT : update: name of the company is required', async() => {

    const companyInputJSON: CompanyS = {
      name: 'K and K Automobiles',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Annai Nagar',
      addressLine2: 'MGR Street',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '223344',
      contact: '7907919930',
      phone: '9656444108'
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const updateCompanyFields: CompanyS = {
      name: '  ',
      email: 'manoharan@Kandk.com',
      addressLine1: 'Vasavi Nagar',
      addressLine2: 'Sira road',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'TAMIL NADU',
      country: 'BHARATHAM',
      pincode: '112255',
      contact: '01234567890',
      phone: '9874563210'
    };
    const updateCompanyResponse = await request(app).put(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updateCompanyFields);
    expect(updateCompanyResponse.status).toBe(HTTP_BAD_REQUEST);

    const updateCompanyFields2: any = {
      email: 'manoharan@Kandk.com',
      addressLine1: 'Vasavi Nagar',
      addressLine2: 'Sira road',
      addressLine3: 'Near Bakery road',
      addressLine4: 'Chennai',
      state: 'TAMIL NADU',
      country: 'BHARATHAM',
      pincode: '112255',
      contact: '01234567890',
      phone: '9874563210'
    };
    const updateCompanyResponse2 = await request(app).put(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updateCompanyFields2);
    expect(updateCompanyResponse2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: Get the details of  saved company', async() => {

    const companyInputJSON: CompanyS = {
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
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

    const company: Company = validResponse.body;

    expect(company.name).toBe(companyInputJSON.name);
    expect(company.email).toBe(companyInputJSON.email);
    expect(company.addressLine1).toBe(companyInputJSON.addressLine1);
    expect(company.addressLine2).toBe(companyInputJSON.addressLine2);
    expect(company.addressLine3).toBe(companyInputJSON.addressLine3);
    expect(company.addressLine4).toBe(companyInputJSON.addressLine4);
    expect(company.state).toBe(companyInputJSON.state);
    expect(company.country).toBe(companyInputJSON.country);
    expect(company.pincode).toBe(companyInputJSON.pincode);
    expect(company.contact).toBe(companyInputJSON.contact);
    expect(company).toHaveProperty('code');

  });

  it('SHOULD NOT: Get the details of  saved company without user token', async() => {

    const companyInputJSON: CompanyS = {
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
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.COMPANY_URI}/${response.body._id}`);
    expect(validResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: Get the details of  saved company with an invalid user token', async() => {

    const companyInputJSON: CompanyS = {
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
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);
    // Get response
    const validResponse = await request(app).get(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer2 ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD : Send BAD REQUEST when trying to fetch  company record with invalid/dumb id', async() => {

    const companyInputJSON: CompanyS = {
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
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

    const company: Company = validResponse.body;

    expect(company.name).toBe(companyInputJSON.name);
    expect(company.email).toBe(companyInputJSON.email);
    expect(company.addressLine1).toBe(companyInputJSON.addressLine1);
    expect(company.addressLine2).toBe(companyInputJSON.addressLine2);
    expect(company.addressLine3).toBe(companyInputJSON.addressLine3);
    expect(company.addressLine4).toBe(companyInputJSON.addressLine4);
    expect(company.state).toBe(companyInputJSON.state);
    expect(company.country).toBe(companyInputJSON.country);
    expect(company.pincode).toBe(companyInputJSON.pincode);
    expect(company.contact).toBe(companyInputJSON.contact);

    const dumbResponse = await request(app).get(`${AuthUris.COMPANY_URI}/abc`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(dumbResponse.status).toBe(HTTP_BAD_REQUEST);

    const invalidIdResponse = await request(app).get(`${AuthUris.COMPANY_URI}/5ed24574d1383411e036dfc2`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(invalidIdResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD : List all companies saved', async() => {

    const companyInputJSON1: CompanyS = {
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
    const response1 = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON1);
    expect(response1.status).toBe(HTTP_OK);

    const companyInputJSON2: CompanyS = {
      name: 'Biscuit Company',
      email: 'sagar@JackyGold.com',
      addressLine1: 'Dharavi',
      addressLine2: 'King street',
      addressLine3: 'Opp Forum Mall',
      addressLine4: 'Golden Avenue',
      state: 'Mumbai',
      country: 'India',
      pincode: '223344',
      contact: '9656444108',
      phone: '7907919930'
    };
    const response2 = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON2);
    expect(response2.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.COMPANY_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

    const companies: Array<Company> = validResponse.body;

    expect(companies).toMatchObject([ companyInputJSON1, companyInputJSON2 ]);
    companies.forEach((company) => {

      expect(company).toHaveProperty('code');

    });

  });

  it('SHOULD NOT : List all companies saved without user token', async() => {

    const companyInputJSON1: CompanyS = {
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
    const response1 = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON1);
    expect(response1.status).toBe(HTTP_OK);

    const companyInputJSON2: CompanyS = {
      name: 'Biscuit Company',
      email: 'sagar@JackyGold.com',
      addressLine1: 'Dharavi',
      addressLine2: 'King street',
      addressLine3: 'Opp Forum Mall',
      addressLine4: 'Golden Avenue',
      state: 'Mumbai',
      country: 'India',
      pincode: '223344',
      contact: '9656444108',
      phone: '7907919930'
    };
    const response2 = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON2);
    expect(response2.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.COMPANY_URI}`);
    expect(validResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT : List all companies saved with an invalid user token', async() => {

    const companyInputJSON1: CompanyS = {
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
    const response1 = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON1);
    expect(response1.status).toBe(HTTP_OK);

    const companyInputJSON2: CompanyS = {
      name: 'Biscuit Company',
      email: 'sagar@JackyGold.com',
      addressLine1: 'Dharavi',
      addressLine2: 'King street',
      addressLine3: 'Opp Forum Mall',
      addressLine4: 'Golden Avenue',
      state: 'Mumbai',
      country: 'India',
      pincode: '223344',
      contact: '9656444108',
      phone: '7907919930'
    };
    const response2 = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON2);
    expect(response2.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.COMPANY_URI}`)
      .set('Authorization', `Bearer2 ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD : Save and delete  Company', async() => {

    const companyInputJSON: CompanyS = {
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
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app)['delete'](`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

  });

  it('SHOULD NOT: delete a company without a user token', async() => {

    const companyInputJSON: CompanyS = {
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
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app)['delete'](`${AuthUris.COMPANY_URI}/${response.body._id}`);
    expect(validResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: delete a company without an invalid user token', async() => {

    const companyInputJSON: CompanyS = {
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
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app)['delete'](`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer2 ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT : Delete  company using dumb/invalid id', async() => {

    const companyInputJSON: CompanyS = {
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
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app)['delete'](`${AuthUris.COMPANY_URI}/abc`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

    const deletedResponse = await request(app)['delete'](`${AuthUris.COMPANY_URI}/5ed2497242e04916ef53c87a`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(deletedResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD : send  BAD REQUEST: deleting an already deleted Company', async() => {

    const companyInputJSON: CompanyS = {
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
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app)['delete'](`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

    const deletedResponse = await request(app)['delete'](`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(deletedResponse.status).toBe(HTTP_BAD_REQUEST);

  });

});
