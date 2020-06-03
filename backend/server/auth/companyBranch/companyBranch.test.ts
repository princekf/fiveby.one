/* eslint {max-lines-per-function: 0, max-statements:0, max-lines:0} */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import User from '../../auth/user/user.model';
import Company from '../company/company.model';
import CompanyBranch from './companyBranch.model';
import { Constants, CompanyBranch as CompanyBranchEntity, Company as CompanyEntity, AuthUris, CompanyS, CompanyBranchS } from 'fivebyone';


const { HTTP_OK, HTTP_BAD_REQUEST } = Constants;
const companyInputJSON: CompanyS = {
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
  phone: '7907919930'
};

describe(`${AuthUris.COMPANY_BRANCH_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';

  const createTestUser = async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });
    const company = new Company(companyInputJSON);
    company.save();
    await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    const user = new User();
    user.email = 'test@email.com';
    user.name = 'Test User';
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

  // Connect to mongoose mock, create a test user and get the access token


  // Remove test user, disconnect and stop database
  afterAll(async() => {

    await User.remove({});
    await mongoose.disconnect();
    await mongod.stop();

  });

  beforeEach(async() => {

    await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);

  });

  // Remove sample items
  afterEach(async() => {

    await Company.remove({});
    await CompanyBranch.remove({});

  });

  it('Should save a Company Branch with valid values', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    const companyBranch: CompanyBranchEntity = getResponse.body;
    expect(getResponse.status).toBe(HTTP_OK);
    expect(companyBranch).toHaveProperty('company');
    expect(companyBranch.name).toBe(companyBranchInput.name);
    expect(companyBranch.addressLine1).toBe(companyBranchInput.addressLine1);
    expect(companyBranch.addressLine2).toBe(companyBranchInput.addressLine2);
    expect(companyBranch.addressLine3).toBe(companyBranchInput.addressLine3);
    expect(companyBranch.addressLine4).toBe(companyBranchInput.addressLine4);
    expect(companyBranch.phone).toBe(companyBranchInput.phone);
    expect(companyBranch.contact).toBe(companyBranchInput.contact);
    expect(companyBranch.state).toBe(companyBranchInput.state);
    expect(companyBranch.country).toBe(companyBranchInput.country);
    expect(companyBranch.pincode).toBe(companyBranchInput.pincode);

  });

  it('Should save a Company Branch two distinct financial years', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
      },
      {
        name: '2020-21',
        startDate: '2020-02-02',
        endDate: '2021-02-01'
      } ]
    };
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    const companyBranch: CompanyBranchEntity = getResponse.body;
    expect(getResponse.status).toBe(HTTP_OK);
    expect(companyBranch.finYears).toMatchObject(companyBranchInput.finYears);

  });

  it('Should not save a Company Branch: financial years overlapping each other', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
      },
      {
        name: '2020-21',
        startDate: '2020-01-02',
        endDate: '2021-02-01'
      } ]
    };
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

    const companyBranchInput2: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
      },
      {
        name: '2020-21',
        startDate: '2020-01-02',
        endDate: '2021-02-01'
      } ]
    };
    const response2 = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput2);
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save without financial year', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const companyBranchInput: any = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
      addressLine1: 'Panvel - Kochi - Kanyakumari Highway',
      addressLine2: 'Vikas Nagar',
      addressLine3: 'Maradu',
      addressLine4: 'Ernakulam',
      contact: '7907919930',
      phone: '9656444108',
      email: 'contactUs@rajasreeKochi.com',
      state: 'Kerala',
      country: 'India',
      pincode: '685588'
    };
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save: no name for financial year', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const companyBranchInput: any = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
        name: '   ',
        startDate: '2019-02-01',
        endDate: '2020-02-01'
      } ]
    };
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save: no start date for financial year', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const companyBranchInput: any = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
        name: '2019-2020',
        startDate: '  ',
        endDate: '2020-02-01'
      } ]
    };
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save: no end date for financial year', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const companyBranchInput: any = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
        name: '2019-2020',
        startDate: '2019-02-01',
        endDate: '  '
      } ]
    };
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save: start date year should not come after end date year', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const companyBranchInput: any = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
        startDate: '2020-02-01',
        endDate: '2019-02-01'
      } ]
    };
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save: start day should not come after end day', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const companyBranchInput: any = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
        startDate: '2019-01-03',
        endDate: '2019-01-01'
      } ]
    };
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save: start date month should not come after end date month', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const companyBranchInput: any = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
        endDate: '2019-01-01'
      } ]
    };
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save a Company Branch with minimum values', async() => {

    const companyResponse: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: companyResponse,
        name: 'Rajasree Motors',
        finYears: [ {
          name: '2019-20',
          startDate: '2019-02-01',
          endDate: '2020-02-01'
        } ]
      });
    expect(response.status).toBe(HTTP_OK);

    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const companyBranch: CompanyBranchEntity = getResponse.body;

    expect(getResponse.status).toBe(HTTP_OK);
    expect(companyBranch).toHaveProperty('company');
    expect(companyBranch.name).toBe('Rajasree Motors');

  });

  it('Should not save: Company Branch without name', async() => {

    const companyResponse: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: companyResponse,
        name: '',
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
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save: Company Branch without their parent company', async() => {

    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Rajasree Motors',
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
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save: Company Branch with an invalid parent company', async() => {

    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: {
          _id: '5ed3ab58c697087cfd0eac9d'
        },
        name: 'Rajasree Motors',
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
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save: invalid email Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
      addressLine1: 'Panvel - Kochi - Kanyakumari Highway',
      addressLine2: 'Vikas Nagar',
      addressLine3: 'Maradu',
      addressLine4: 'Ernakulam',
      contact: '7907919930',
      phone: '9656444108',
      email: 'contactUs@rajasreeKochi',
      state: 'Kerala',
      country: 'India',
      pincode: '685588',
      finYears: [ {
        name: '2019-20',
        startDate: '2019-02-01',
        endDate: '2020-02-01'
      } ]
    };
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save: invalid contact and phone', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
      addressLine1: 'Panvel - Kochi - Kanyakumari Highway',
      addressLine2: 'Vikas Nagar',
      addressLine3: 'Maradu',
      addressLine4: 'Ernakulam',
      contact: '1234',
      phone: '5678',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save a Company Branch  and update company branch', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
      addressLine1: 'Your Premium Cars',
      addressLine2: 'Building No 2/278(1)',
      addressLine3: 'Opp.Meleth Pump',
      addressLine4: 'NH-47 Byepass',
      contact: '9656444108',
      phone: '7907919930',
      email: 'customerCare@rajasreeKochi.com',
      state: 'Kerala',
      country: 'India',
      pincode: '685588',
      finYears: [ {
        name: '2019-20',
        startDate: '2019-02-01',
        endDate: '2020-02-01'
      },
      {
        name: '2020-21',
        startDate: '2020-02-02',
        endDate: '2021-02-01'
      }, ]
    };

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updatedCompanyBranchInput);
    const updatedCompanyBranch: CompanyBranchEntity = updateResponse.body;

    expect(updateResponse.status).toBe(HTTP_OK);
    expect(updatedCompanyBranch).toHaveProperty('company');
    expect(updatedCompanyBranch.name).toBe(updatedCompanyBranchInput.name);
    expect(updatedCompanyBranch.addressLine1).toBe(updatedCompanyBranchInput.addressLine1);
    expect(updatedCompanyBranch.addressLine2).toBe(updatedCompanyBranchInput.addressLine2);
    expect(updatedCompanyBranch.addressLine3).toBe(updatedCompanyBranchInput.addressLine3);
    expect(updatedCompanyBranch.addressLine4).toBe(updatedCompanyBranchInput.addressLine4);
    expect(updatedCompanyBranch.phone).toBe(updatedCompanyBranchInput.phone);
    expect(updatedCompanyBranch.contact).toBe(updatedCompanyBranchInput.contact);
    expect(updatedCompanyBranch.state).toBe(updatedCompanyBranchInput.state);
    expect(updatedCompanyBranch.country).toBe(updatedCompanyBranchInput.country);
    expect(updatedCompanyBranch.pincode).toBe(updatedCompanyBranchInput.pincode);
    expect(updatedCompanyBranch.finYears).toMatchObject(updatedCompanyBranchInput.finYears);

  });

  it('Should not update: overlapping financial years', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
      addressLine1: 'Your Premium Cars',
      addressLine2: 'Building No 2/278(1)',
      addressLine3: 'Opp.Meleth Pump',
      addressLine4: 'NH-47 Byepass',
      contact: '9656444108',
      phone: '7907919930',
      email: 'customerCare@rajasreeKochi.com',
      state: 'Kerala',
      country: 'India',
      pincode: '685588',
      finYears: [ {
        name: '2019-20',
        startDate: '2019-02-01',
        endDate: '2020-02-01'
      },
      {
        name: '2020-21',
        startDate: '2020-01-02',
        endDate: '2021-02-01'
      } ]
    };
    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updatedCompanyBranchInput);
    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update: without financial year name', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
      addressLine1: 'Your Premium Cars',
      addressLine2: 'Building No 2/278(1)',
      addressLine3: 'Opp.Meleth Pump',
      addressLine4: 'NH-47 Byepass',
      contact: '9656444108',
      phone: '7907919930',
      email: 'customerCare@rajasreeKochi.com',
      state: 'Kerala',
      country: 'India',
      pincode: '685588',
      finYears: [ {
        name: ' ',
        startDate: '2019-02-01',
        endDate: '2020-02-01'
      } ]
    };

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updatedCompanyBranchInput);

    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update: startDate comes after endDate', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
      addressLine1: 'Your Premium Cars',
      addressLine2: 'Building No 2/278(1)',
      addressLine3: 'Opp.Meleth Pump',
      addressLine4: 'NH-47 Byepass',
      contact: '9656444108',
      phone: '7907919930',
      email: 'customerCare@rajasreeKochi.com',
      state: 'Kerala',
      country: 'India',
      pincode: '685588',
      finYears: [ {
        name: '2019-20',
        endDate: '2019-02-01',
        startDate: '2020-01-01'
      } ]
    };

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updatedCompanyBranchInput);

    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should update: when startDate == endDate', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
        endDate: '2020-02-01',
        startDate: '2019-02-01'
      } ]
    };
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
      addressLine1: 'Your Premium Cars',
      addressLine2: 'Building No 2/278(1)',
      addressLine3: 'Opp.Meleth Pump',
      addressLine4: 'NH-47 Byepass',
      contact: '9656444108',
      phone: '7907919930',
      email: 'customerCare@rajasreeKochi.com',
      state: 'Kerala',
      country: 'India',
      pincode: '685588',
      finYears: [ {
        name: '2019-20',
        startDate: '2019-02-01',
        endDate: '2019-02-01'
      } ]
    };

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updatedCompanyBranchInput);

    expect(updateResponse.status).toBe(HTTP_OK);

  });

  it('Should save a Company Branch  and update with minimum fields', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: any = {
      company: getCompanyRes,
      name: 'Benz Motors'
    };

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updatedCompanyBranchInput);
    const updatedCompanyBranch: CompanyBranchEntity = updateResponse.body;

    expect(updateResponse.status).toBe(HTTP_OK);

    expect(updatedCompanyBranch).toHaveProperty('company');
    expect(updatedCompanyBranch.name).toBe(updatedCompanyBranch.name);

  });

  it('Should not update: name is required for company branch', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: any = {
      company: getCompanyRes
    };

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updatedCompanyBranchInput);
    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Do not update: Company branch with invalid email Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
      addressLine1: 'Your Premium Cars',
      addressLine2: 'Building No 2/278(1)',
      addressLine3: 'Opp.Meleth Pump',
      addressLine4: 'NH-47 Byepass',
      contact: '9656444108',
      phone: '7907919930',
      email: 'customerCare@rajasreeKochi',
      state: 'Kerala',
      country: 'India',
      pincode: '685588',
      finYears: [ {
        name: '2019-20',
        startDate: '2019-02-01',
        endDate: '2020-02-01'
      } ]
    };

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)

      .set('Authorization', `Bearer ${serverToken}`)
      .send(updatedCompanyBranchInput);
    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Do not update: Company branch with invalid contact and phone', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
      addressLine1: 'Your Premium Cars',
      addressLine2: 'Building No 2/278(1)',
      addressLine3: 'Opp.Meleth Pump',
      addressLine4: 'NH-47 Byepass',
      contact: '12345',
      phone: '56789',
      email: 'customerCare@rajasreeKochi.org',
      state: 'Kerala',
      country: 'India',
      pincode: '685588',
      finYears: [ {
        name: '2019-20',
        startDate: '2019-02-01',
        endDate: '2020-02-01'
      } ]
    };

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updatedCompanyBranchInput);
    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Send a bad request when updating with invalid/dumb id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: any = {
      company: getCompanyRes,
      name: 'Benz Motors'
    };

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/abc`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updatedCompanyBranchInput);

    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);

    const invalidCompanyIdRes = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/5ed3abc3e59a047f2a06e286,`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updatedCompanyBranchInput);

    expect(invalidCompanyIdRes.status).toBe(HTTP_BAD_REQUEST);


  });

  it('Send a bad request when updating with an already deleted id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);

    const updatedCompanyBranchInput: any = {
      company: getCompanyRes,
      name: 'Benz Motors'
    };

    const deletedResponse = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(deletedResponse.status).toBe(HTTP_OK);

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updatedCompanyBranchInput);

    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save a Company Branch and fetch it by using a valid Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    const companyBranch: CompanyBranchEntity = getResponse.body;
    expect(getResponse.status).toBe(HTTP_OK);
    expect(companyBranch).toHaveProperty('company');
    expect(companyBranch.name).toBe(companyBranchInput.name);
    expect(companyBranch.addressLine1).toBe(companyBranchInput.addressLine1);
    expect(companyBranch.addressLine2).toBe(companyBranchInput.addressLine2);
    expect(companyBranch.addressLine3).toBe(companyBranchInput.addressLine3);
    expect(companyBranch.addressLine4).toBe(companyBranchInput.addressLine4);
    expect(companyBranch.phone).toBe(companyBranchInput.phone);
    expect(companyBranch.contact).toBe(companyBranchInput.contact);
    expect(companyBranch.state).toBe(companyBranchInput.state);
    expect(companyBranch.country).toBe(companyBranchInput.country);
    expect(companyBranch.pincode).toBe(companyBranchInput.pincode);

  });

  it('Should save a Company Branch and fetch it by using a dumb Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/abc`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Send BAD REQUEST: fetching with a deleted id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const deletedRes = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(deletedRes.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('List all company branches under a company', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const companyBranch1Input: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors Cochin',
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
    const response1 = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranch1Input);
    expect(response1.status).toBe(HTTP_OK);

    const companyBranch2Input: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors Calicut',
      addressLine1: '6/23 Kannur Road',
      addressLine2: 'Opp Bakery Jn',
      addressLine3: 'West Nadakkavu',
      addressLine4: 'Kozhikode',
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
    const response2 = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranch2Input);
    expect(response2.status).toBe(HTTP_OK);

    const getAllShowRooms = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);

    expect(getAllShowRooms.status).toBe(HTTP_OK);
    const showRooms: Array<CompanyBranchEntity> = getAllShowRooms.body;

    expect(showRooms.length.toString()).toBe('2');
    expect(showRooms[0].name).toBe(companyBranch1Input.name);
    expect(showRooms[1].name).toBe(companyBranch2Input.name);

  });

  it('Create a Company branch and delete it', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const deletedRes = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(deletedRes.status).toBe(HTTP_OK);
    const getDeleted = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(getDeleted.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Send BAD REQUEST when deleting with an invalid/dumb id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const deletedRes = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/abc`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(deletedRes.status).toBe(HTTP_BAD_REQUEST);
    const getDeleted = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(getDeleted.status).toBe(HTTP_OK);

  });

  it('Send BAD REQUEST when deleting an already deleted id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name }); ;
    const companyBranchInput: CompanyBranchS = {
      company: getCompanyRes,
      name: 'Rajasree Motors',
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
    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const deletedRes = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(deletedRes.status).toBe(HTTP_OK);
    const getDeleted = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(getDeleted.status).toBe(HTTP_BAD_REQUEST);

  });


});
