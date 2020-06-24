/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import { UserModel } from '../user/user.model';
import { AdminUserModel } from '../admin/admin.model';
import {
  Constants, AuthUris,
  Company,
  CompanyBranchS,
  CompanyBranch
} from 'fivebyone';
import { CompanyBranchModel } from './companyBranch.model';

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;


describe(`${AuthUris.COMPANY_BRANCH_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let adminToken = '';
  let clientToken = '';
  let company: Company = null;

  const createAdminUser = async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
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
    adminToken = response.body.token;

  };

  const getCompanyData = async(): Promise<Company> => {

    const companyData = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${adminToken}`)
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
    return companyData.body;

  };

  const createRootLevelClient = async() => {

    await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .send(
        {
          name: 'Office',
          mobile: '+91123456789',
          email: 'automobiles@KnK.com',
          password: 'Simple_123@',
          addressLine1: 'Jawahar Nagar',
          addressLine2: 'TTC',
          addressLine3: 'Vellayambalam',
          addressLine4: 'Museum',
          state: 'Kerala',
          country: 'India',
          pinCode: '223344',
        }
      )
      .set('Authorization', `Bearer ${adminToken}`);

    const response = await request(app).post(`${AuthUris.USER_URI}/${company.code}/login`)
      .send(
        {
          email: 'automobiles@KnK.com',
          password: 'Simple_123@'
        }
      );
    clientToken = response.body.token;

  };


  beforeAll(async() => {

    await createAdminUser();
    company = await getCompanyData();

  });

  afterAll(async() => {

    const AdminSchema = AdminUserModel.createModel();
    await AdminSchema.deleteMany({});
    await mongoose.disconnect();
    await mongod.stop();

  });

  beforeEach(async() => {

    await createRootLevelClient();

  });

  afterEach(async() => {

    const User = UserModel.createModel(company.code);
    await User.deleteMany({});
    const CompanyBranchSchema = CompanyBranchModel.createModel(company.code);
    await CompanyBranchSchema.deleteMany({});

  });

  it('Should save a Company Branch with valid values', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    const companyBranch: CompanyBranch = getResponse.body;
    expect(getResponse.status).toBe(HTTP_OK);
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

  it('SHOULD NOT:  save a Company Branch with an invalid token', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer2 ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT:  save a Company Branch without a token', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should save a Company Branch two distinct financial years', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    const companyBranch: CompanyBranch = getResponse.body;
    expect(getResponse.status).toBe(HTTP_OK);
    expect(companyBranch.finYears).toMatchObject(companyBranchInput.finYears);

  });

  it('Should not save a Company Branch: financial years overlapping each other', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(response.body).toHaveProperty('message');

    const companyBranchInput2: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput2);
    expect(response2.status).toBe(HTTP_BAD_REQUEST);
    expect(response2.body).toHaveProperty('message');

  });

  it('Should not save without financial year', async() => {

    const companyBranchInput: any = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(response.body).toHaveProperty('message');

  });


  it('Should not save: no name for financial year', async() => {

    const companyBranchInput: any = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(response.body).toHaveProperty('message');

  });

  it('Should not save: no start date for financial year', async() => {

    const companyBranchInput: any = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(response.body).toHaveProperty('message');

  });

  it('Should not save: no end date for financial year', async() => {

    const companyBranchInput: any = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(response.body).toHaveProperty('message');

  });

  it('Should not save: start date year should not come after end date year', async() => {

    const companyBranchInput: any = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(response.body).toHaveProperty('message');

  });

  it('Should not save: start day should not come after end day', async() => {

    const companyBranchInput: any = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(response.body).toHaveProperty('message');

  });

  it('Should not save: start date month should not come after end date month', async() => {

    const companyBranchInput: any = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(response.body).toHaveProperty('message');

  });

  it('Should save a Company Branch with minimum values', async() => {

    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Rajasree Motors',
        finYears: [ {
          name: '2019-20',
          startDate: '2019-02-01',
          endDate: '2020-02-01'
        } ]
      });
    expect(response.status).toBe(HTTP_OK);

    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const companyBranch: CompanyBranch = getResponse.body;

    expect(getResponse.status).toBe(HTTP_OK);
    expect(companyBranch.name).toBe('Rajasree Motors');

  });

  it('Should not save: Company Branch without name', async() => {

    const response = await request(app).post(AuthUris.COMPANY_BRANCH_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
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
    expect(response.body).toHaveProperty('message');

  });

  it('Should not save: invalid email Id', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(response.body).toHaveProperty('message');

  });

  it('Should not save: invalid contact and phone', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(response.body).toHaveProperty('message');

  });

  it('Should save a Company Branch  and update company branch', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(updatedCompanyBranchInput);
    const updatedCompanyBranch: CompanyBranch = updateResponse.body;

    expect(updateResponse.status).toBe(HTTP_OK);
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

  it('Should not not update a company branch with an invalid token', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer2 ${clientToken}`)
      .send(updatedCompanyBranchInput);

    expect(updateResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not update a Company Branch with empty token', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
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
      .send(updatedCompanyBranchInput);

    expect(updateResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not update: overlapping financial years', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(updatedCompanyBranchInput);
    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);
    expect(updateResponse.body).toHaveProperty('message');

  });
  it('Should not update: without financial year name', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(updatedCompanyBranchInput);

    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);
    expect(updateResponse.body).toHaveProperty('message');

  });

  it('Should not update: startDate comes after endDate', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(updatedCompanyBranchInput);

    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);
    expect(updateResponse.body).toHaveProperty('message');

  });

  it('Should update: when startDate == endDate', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(updatedCompanyBranchInput);

    expect(updateResponse.status).toBe(HTTP_OK);

  });

  it('Should save a Company Branch  and update with minimum fields', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: any = {

      name: 'Benz Motors',
      finYears: [ {
        name: '2018-19',
        startDate: '2019-03-05',
        endDate: '2020-02-05'
      } ]
    };

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(updatedCompanyBranchInput);
    const updatedCompanyBranch: CompanyBranch = updateResponse.body;

    expect(updateResponse.status).toBe(HTTP_OK);
    expect(updatedCompanyBranch.name).toBe(updatedCompanyBranch.name);
    expect(updatedCompanyBranch.finYears).toMatchObject(updatedCompanyBranch.finYears);

  });

  it('Should not update: name is required for company branch', async() => {


    const companyBranchInput: CompanyBranchS = {

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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: any = {
      name: '      ',
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

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(updatedCompanyBranchInput);
    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);
    expect(updateResponse.body).toHaveProperty('message');

  });

  it('Do not update: Company branch with invalid email Id', async() => {


    const companyBranchInput: CompanyBranchS = {

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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {

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

      .set('Authorization', `Bearer ${clientToken}`)
      .send(updatedCompanyBranchInput);
    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);
    expect(updateResponse.body).toHaveProperty('message');

  });

  it('Do not update: Company branch with invalid contact and phone', async() => {


    const companyBranchInput: CompanyBranchS = {

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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: CompanyBranchS = {

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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(updatedCompanyBranchInput);
    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);
    expect(updateResponse.body).toHaveProperty('message');

  });

  it('Send a bad request when updating with invalid/dumb id', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_OK);
    const updatedCompanyBranchInput: any = {
      name: 'Benz Motors',
      finYears: [ {
        name: '2019-20',
        startDate: '2019-05-01',
        endDate: '2020-04-31'
      } ]
    };

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/abc`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(updatedCompanyBranchInput);

    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);

    const invalidCompanyIdRes = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/5ed3abc3e59a047f2a06e286,`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(updatedCompanyBranchInput);

    expect(invalidCompanyIdRes.status).toBe(HTTP_BAD_REQUEST);
    expect(updateResponse.body).toHaveProperty('message');


  });

  it('Send a bad request when updating with an already deleted id', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);

    const updatedCompanyBranchInput: any = {
      name: 'Benz Motors'
    };

    const deletedResponse = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(deletedResponse.status).toBe(HTTP_OK);

    const updateResponse = await request(app).put(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(updatedCompanyBranchInput);

    expect(updateResponse.status).toBe(HTTP_BAD_REQUEST);
    expect(updateResponse.body).toHaveProperty('message');

  });

  it('Should save a Company Branch and fetch it by using a valid Id', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    const companyBranch: CompanyBranch = getResponse.body;
    expect(getResponse.status).toBe(HTTP_OK);
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

  it('SHOULD NOT: save a company branch using an invalid token', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer2 ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: save a company branch using an empty token', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: fetch a company branch using a dumb Id', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/abc`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_BAD_REQUEST);
    expect(getResponse.body).toHaveProperty('message');

  });

  it('Send BAD REQUEST: fetching with a deleted id', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const deletedRes = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(deletedRes.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(getResponse.status).toBe(HTTP_BAD_REQUEST);
    expect(getResponse.body).toHaveProperty('message');

  });

  it('List all company branches under a company', async() => {

    const companyBranch1Input: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranch1Input);
    expect(response1.status).toBe(HTTP_OK);

    const companyBranch2Input: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranch2Input);
    expect(response2.status).toBe(HTTP_OK);

    const getAllShowRooms = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(getAllShowRooms.status).toBe(HTTP_OK);
    const showRooms: Array<CompanyBranch> = getAllShowRooms.body;

    expect(showRooms.length.toString()).toBe('2');
    expect(showRooms[0].name).toBe(companyBranch1Input.name);
    expect(showRooms[1].name).toBe(companyBranch2Input.name);

  });

  it('SHOULD NOT: list all companies with an invalid token', async() => {

    const companyBranch1Input: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranch1Input);
    expect(response1.status).toBe(HTTP_OK);

    const companyBranch2Input: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranch2Input);
    expect(response2.status).toBe(HTTP_OK);

    const getAllShowRooms = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}`)
      .set('Authorization', `Bearer2 ${clientToken}`);

    expect(getAllShowRooms.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: list all companies with empty token', async() => {

    const companyBranch1Input: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranch1Input);
    expect(response1.status).toBe(HTTP_OK);

    const companyBranch2Input: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranch2Input);
    expect(response2.status).toBe(HTTP_OK);

    const getAllShowRooms = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}`);

    expect(getAllShowRooms.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Create a Company branch and delete it', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const deletedRes = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(deletedRes.status).toBe(HTTP_OK);
    const getDeleted = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(getDeleted.status).toBe(HTTP_BAD_REQUEST);
    expect(getDeleted.body).toHaveProperty('message');

  });

  it('SHOULD NOT: Delete a company branch with an invalid token', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const deletedRes = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer2 ${clientToken}`);
    expect(deletedRes.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: Delete a company branch with an empty token', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const deletedRes = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`);
    expect(deletedRes.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Send BAD REQUEST when deleting with an invalid/dumb id', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const deletedRes = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/abc`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(deletedRes.status).toBe(HTTP_BAD_REQUEST);
    expect(deletedRes.body).toHaveProperty('message');
    const getDeleted = await request(app).get(`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(getDeleted.status).toBe(HTTP_OK);

  });

  it('Send BAD REQUEST when deleting an already deleted id', async() => {

    const companyBranchInput: CompanyBranchS = {
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send(companyBranchInput);
    expect(response.status).toBe(HTTP_OK);
    const deletedRes = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(deletedRes.status).toBe(HTTP_OK);
    const getDeleted = await request(app)['delete'](`${AuthUris.COMPANY_BRANCH_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(getDeleted.status).toBe(HTTP_BAD_REQUEST);
    expect(getDeleted.body).toHaveProperty('message');

  });

});
