/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import Company from './company.model';
import User from '../user/user.model';
import { Constants, AuthUris, CompanyS as CompanyI, Company as CompanyEntity } from 'fivebyone';

const { HTTP_OK, HTTP_BAD_REQUEST } = Constants;
const companyData: CompanyI = {
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

describe(`${AuthUris.COMPANY_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';

  const createTestUser = async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });
    const company = new Company(companyData);
    await company.save();
    await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyData);
    const user = new User();
    user.name = 'Test User';
    user.email = 'test@email.com';
    user.company = company;
    user.setPassword('Simple_123@');
    await user.save();

  };

  beforeAll(async() => {

    await createTestUser();
    const response = await request(app).post(`${AuthUris.USER_URI}/login`)
      .send({
        email: 'test@email.com',
        password: 'Simple_123@',
      });
    const { body: { token } } = response;
    serverToken = token;

  });

  afterAll(async() => {

    await mongoose.disconnect();
    await mongod.stop();

  });

  afterEach(async() => {

    await User.remove({});
    await Company.remove({});

  });

  it('Should save a company with valid values.', async() => {

    const companyInputJSON: CompanyI = {
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

    const company: CompanyEntity = validResponse.body;

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

  });

  it('Should save a company with minimal values.', async() => {

    const companyInputJSON: any = {
      name: 'K and K Automobiles'
    };
    const response = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.COMPANY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

    const company: CompanyEntity = validResponse.body;

    expect(company.name).toBe(companyInputJSON.name);

  });

  it('Should not save a company - Name required.', async() => {

    const companyInputJSON: CompanyI = {
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
      .send(companyInputJSON);
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

    const companyInputJSON2: any = {
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
      .send(companyInputJSON2);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save a company - invalid email Id', async() => {

    const companyInputJSON: CompanyI = {
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

  it('Should not save a company - invalid  contact Number', async() => {

    const companyInputJSON: CompanyI = {
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

  it('Should not save a company - invalid  Phone Number', async() => {

    const companyInputJSON: CompanyI = {
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

  it('Should not save a company - email Id has to be unique', async() => {

    const companyInputJSON: CompanyI = {
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

    const otherCompanyInput: CompanyI = {
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

  it('Create and Company and update the fields of the company-valid values', async() => {

    const companyInputJSON: CompanyI = {
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

    const updateCompanyFields: CompanyI = {
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

    const getCompanyData: CompanyI = getCompanyResponse.body;

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

  });

  it('Send a bad request if the body is empty for an update', async() => {

    const companyInputJSON: CompanyI = {
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

  it('Send a bad request for a request to update without body', async() => {

    const companyInputJSON: CompanyI = {
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

  it('Should not update: name of the company is required', async() => {

    const companyInputJSON: CompanyI = {
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

    const updateCompanyFields: CompanyI = {
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

  });

  it('Get the details of a saved company', async() => {

    const companyInputJSON: CompanyI = {
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

    const company: CompanyEntity = validResponse.body;

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

  });

  it('Send BAD REQUEST when trying to fetch a company record with invalid/dumb id', async() => {

    const companyInputJSON: CompanyI = {
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

    const company: CompanyEntity = validResponse.body;

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

  it('List all companies saved', async() => {

    const companyInputJSON1: CompanyI = {
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

    const companyInputJSON2: CompanyI = {
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

    const companies: Array<CompanyI> = validResponse.body;

    expect(companies).toMatchObject([ companyInputJSON1, companyInputJSON2 ]);

  });


  it('Save and delete a Company', async() => {

    const companyInputJSON: CompanyI = {
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

  it('Delete a company using dumb/invalid id', async() => {

    const companyInputJSON: CompanyI = {
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

  it('Should send a BAD REQUEST: deleting an already deleted Company', async() => {

    const companyInputJSON: CompanyI = {
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
