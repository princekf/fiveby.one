/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import {UserModel} from '../../auth/user/user.model';
import {TaxModel} from './tax.model';
import { Constants, Tax as TaxEntity, InventoryUris, AuthUris, CompanyS as CompanyI} from 'fivebyone';

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;

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

describe(`${InventoryUris.TAX_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';
  let serverTokenAdmin = '';
  let companyDetails: any;

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

  beforeAll(async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });

    await createTestAdmin();
    await createTestUser();

  });

  // Remove sample items
  afterEach(async() => {

    const Tax = TaxModel.createModel(companyDetails.code);
    await Tax.remove({});

  });

  // Remove test user, disconnect and stop database
  afterAll(async() => {

    const User = UserModel.createModel(companyDetails.code);
    await User.remove({});
    await mongoose.disconnect();
    await mongod.stop();

  });

  it('Should save tax with valid values.', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2020-12-31',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.TAX_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const tax1: TaxEntity = response1.body;
    expect(tax1.name).toBe('CGST-9');
    expect(tax1.groupName).toBe('CGST');
    expect(tax1.effectiveFrom.length).toBe(1);
    expect(tax1.effectiveFrom[0].percentage).toBe(tPercentage);
    expect(tax1.effectiveFrom[0].startDate).toBe('2018-01-01');
    expect(tax1.effectiveFrom[0].endDate).toBe('2020-12-31');

  });

  it('Should save tax with after trim.', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: ' CGST-9 ',
        groupName: ' CGST ',
        effectiveFrom: [ {
          startDate: ' 2018-01-01 ',
          endDate: ' 2020-12-31 ',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.TAX_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const tax1: TaxEntity = response1.body;
    expect(tax1.name).toBe('CGST-9');
    expect(tax1.groupName).toBe('CGST');
    expect(tax1.effectiveFrom.length).toBe(1);
    expect(tax1.effectiveFrom[0].percentage).toBe(tPercentage);
    expect(tax1.effectiveFrom[0].startDate).toBe('2018-01-01');
    expect(tax1.effectiveFrom[0].endDate).toBe('2020-12-31');

  });

  it('Should  save tax with 2 effective from', async() => {

    const tPercentage1 = 18;
    const tPercentage2 = 14;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2018-12-31',
          percentage: tPercentage1
        },
        {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage2
        } ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.TAX_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const tax1: TaxEntity = response1.body;
    expect(tax1.name).toBe('CGST-9');
    expect(tax1.groupName).toBe('CGST');
    const effectiveLength = 2;
    expect(tax1.effectiveFrom.length).toBe(effectiveLength);

    expect(tax1.effectiveFrom[0].percentage).toBe(tPercentage1);
    expect(tax1.effectiveFrom[0].startDate).toBe('2018-01-01');
    expect(tax1.effectiveFrom[0].endDate).toBe('2018-12-31');
    expect(tax1.effectiveFrom[1].percentage).toBe(tPercentage2);
    expect(tax1.effectiveFrom[1].startDate).toBe('2019-01-01');
    expect(tax1.effectiveFrom[1].endDate).toBe('2019-12-31');

  });

  it('Should not save tax with valid start and end date in invalid string format', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-18',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018/02/02',
          endDate: '2020/11/30',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save tax with invalid token.', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer2 ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2020-12-31',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not save tax with empty name', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: '',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2020-12-31',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with no name', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2020-12-31',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with empty group name', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: '',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2020-12-31',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with no group name', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2020-12-31',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with no effective from', async() => {

    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with empty effective from', async() => {

    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: []
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with empty start date', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST=18',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '',
          endDate: '2020-12-31',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with no start date', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST=18',
        groupName: 'CGST',
        effectiveFrom: [ {
          endDate: '2020-12-31',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with invalid start date', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST=18',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '12/31/2020',
          endDate: '2020-12-31',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save tax with empty end date', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST=18',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2020-12-01',
          endDate: '',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with no end date', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST=18',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2020-12-01',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with invalid end date', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST=18',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2020-12-01',
          endDate: '12/31/2020',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with if end date is before start date', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST=18',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2020-12-02',
          endDate: '2020-12-01',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not  save tax if there is 2 or more taxes configured for a particular day.', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST=18',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2020-01-01',
          endDate: '2020-01-31',
          percentage: tPercentage
        },
        {
          startDate: '2020-03-31',
          endDate: '2020-05-31',
          percentage: tPercentage
        },
        {
          startDate: '2020-02-01',
          endDate: '2020-03-31',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with empty percentage', async() => {

    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST=18',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2020-12-02',
          endDate: '2021-12-01',
          percentage: ''
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with no percentage', async() => {

    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST=18',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2020-12-02',
          endDate: '2021-12-01',
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with negative percentage', async() => {

    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST=18',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2020-12-02',
          endDate: '2021-12-01',
          percentage: -1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save tax with invalid percentage', async() => {

    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST=18',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2020-12-02',
          endDate: '2021-12-01',
          percentage: 'ab.dd'
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should list empty when no taxes', async() => {

    const response = await request(app).get(`${InventoryUris.TAX_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_OK);
    const taxes: TaxEntity[] = response.body;
    expect(taxes.length).toBe(0);

  });

  it('Should list taxes', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2020-12-31',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.TAX_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    let taxes: TaxEntity[] = response1.body;
    expect(taxes.length).toBe(1);
    let [ tax1 ] = taxes;
    expect(tax1.name).toBe('CGST-9');
    expect(tax1.groupName).toBe('CGST');
    expect(tax1.effectiveFrom.length).toBe(1);
    expect(tax1.effectiveFrom[0].percentage).toBe(tPercentage);
    expect(tax1.effectiveFrom[0].startDate).toBe('2018-01-01');
    expect(tax1.effectiveFrom[0].endDate).toBe('2020-12-31');


    const response2 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-14',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2020-12-31',
          percentage: tPercentage
        } ]
      });
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).get(`${InventoryUris.TAX_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    taxes = response3.body;
    const taxLength = 2;
    expect(taxes.length).toBe(taxLength);
    [ tax1 ] = taxes;
    expect(tax1.name).toBe('CGST-9');
    expect(tax1.groupName).toBe('CGST');
    expect(tax1.effectiveFrom.length).toBe(1);
    expect(tax1.effectiveFrom[0].percentage).toBe(tPercentage);
    expect(tax1.effectiveFrom[0].startDate).toBe('2018-01-01');
    expect(tax1.effectiveFrom[0].endDate).toBe('2020-12-31');
    [ , tax1 ] = taxes;
    expect(tax1.name).toBe('CGST-14');
    expect(tax1.groupName).toBe('CGST');
    expect(tax1.effectiveFrom.length).toBe(1);
    expect(tax1.effectiveFrom[0].percentage).toBe(tPercentage);
    expect(tax1.effectiveFrom[0].startDate).toBe('2018-01-01');
    expect(tax1.effectiveFrom[0].endDate).toBe('2020-12-31');

  });


  it('Should list if taxes with more than one effectiveFrom', async() => {

    const tPercentage = 18;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2020-12-31',
          percentage: tPercentage
        },
        {
          startDate: '2021-01-01',
          endDate: '2022-12-31',
          percentage: tPercentage
        } ]
      });

    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.TAX_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const taxes: TaxEntity[] = response1.body;
    expect(taxes.length).toBe(1);
    const [ tax1 ] = taxes;
    expect(tax1.name).toBe('CGST-9');
    expect(tax1.groupName).toBe('CGST');
    const effectiveFromLength = 2;
    expect(tax1.effectiveFrom.length).toBe(effectiveFromLength);
    expect(tax1.effectiveFrom[0].percentage).toBe(tPercentage);
    expect(tax1.effectiveFrom[0].startDate).toBe('2018-01-01');
    expect(tax1.effectiveFrom[0].endDate).toBe('2020-12-31');

    expect(tax1.effectiveFrom[1].percentage).toBe(tPercentage);
    expect(tax1.effectiveFrom[1].startDate).toBe('2021-01-01');
    expect(tax1.effectiveFrom[1].endDate).toBe('2022-12-31');

  });

  it('Should update tax with valid values', async() => {

    const tPercentage = 18;
    const response2 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9-1',
        groupName: 'CGST-1',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2021-12-31',
          percentage: tPercentage - 1
        } ]
      });
    expect(response2.status).toBe(HTTP_OK);
    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2020-12-31',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.TAX_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const tax1: TaxEntity = response1.body;
    expect(tax1.name).toBe('CGST-9');
    expect(tax1.groupName).toBe('CGST');
    expect(tax1.effectiveFrom.length).toBe(1);
    expect(tax1.effectiveFrom[0].percentage).toBe(tPercentage);
    expect(tax1.effectiveFrom[0].startDate).toBe('2018-01-01');
    expect(tax1.effectiveFrom[0].endDate).toBe('2020-12-31');

  });

  it('Should update tax after trim', async() => {

    const tPercentage = 18;
    const response2 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9-1',
        groupName: 'CGST-1',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2021-12-31',
          percentage: tPercentage - 1
        } ]
      });
    expect(response2.status).toBe(HTTP_OK);
    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: ' CGST-9 ',
        groupName: ' CGST ',
        effectiveFrom: [ {
          startDate: ' 2018-01-01 ',
          endDate: ' 2020-12-31 ',
          percentage: tPercentage
        } ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.TAX_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const tax1: TaxEntity = response1.body;
    expect(tax1.name).toBe('CGST-9');
    expect(tax1.groupName).toBe('CGST');
    expect(tax1.effectiveFrom.length).toBe(1);
    expect(tax1.effectiveFrom[0].percentage).toBe(tPercentage);
    expect(tax1.effectiveFrom[0].startDate).toBe('2018-01-01');
    expect(tax1.effectiveFrom[0].endDate).toBe('2020-12-31');

  });

  it('Should update tax with 2 effective from - 1', async() => {

    const tPercentage1 = 18;
    const tPercentage2 = 14;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-90',
        groupName: 'CGST0',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1 - 1
        },
        {
          startDate: '2020-01-01',
          endDate: '2020-12-31',
          percentage: tPercentage2 - 1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2018-12-31',
          percentage: tPercentage1
        },
        {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage2
        } ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const tax1: TaxEntity = response1.body;
    expect(tax1.name).toBe('CGST-9');
    expect(tax1.groupName).toBe('CGST');
    const effectiveLength = 2;
    expect(tax1.effectiveFrom.length).toBe(effectiveLength);

    expect(tax1.effectiveFrom[0].percentage).toBe(tPercentage1);
    expect(tax1.effectiveFrom[0].startDate).toBe('2018-01-01');
    expect(tax1.effectiveFrom[0].endDate).toBe('2018-12-31');
    expect(tax1.effectiveFrom[1].percentage).toBe(tPercentage2);
    expect(tax1.effectiveFrom[1].startDate).toBe('2019-01-01');
    expect(tax1.effectiveFrom[1].endDate).toBe('2019-12-31');

  });


  it('Should update tax with 2 effective from - 2', async() => {

    const tPercentage1 = 18;
    const tPercentage2 = 14;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-90',
        groupName: 'CGST0',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1 - 1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2018-12-31',
          percentage: tPercentage1
        },
        {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage2
        } ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const tax1: TaxEntity = response1.body;
    expect(tax1.name).toBe('CGST-9');
    expect(tax1.groupName).toBe('CGST');
    const effectiveLength = 2;
    expect(tax1.effectiveFrom.length).toBe(effectiveLength);

    expect(tax1.effectiveFrom[0].percentage).toBe(tPercentage1);
    expect(tax1.effectiveFrom[0].startDate).toBe('2018-01-01');
    expect(tax1.effectiveFrom[0].endDate).toBe('2018-12-31');
    expect(tax1.effectiveFrom[1].percentage).toBe(tPercentage2);
    expect(tax1.effectiveFrom[1].startDate).toBe('2019-01-01');
    expect(tax1.effectiveFrom[1].endDate).toBe('2019-12-31');

  });

  it('Should not update tax with valid start and end date in invalid string format', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    let response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018/01/01',
          endDate: '2018-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

    response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019/12/31',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with empty name', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: '',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2018-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update tax with no name', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2018-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with empty group name', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: '',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2018-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with no group name', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2018-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with no effective from', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: null,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update tax with empty effective from', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: []
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with empty start date', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with no start date', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with invalid start date', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-32',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update tax with empty end date', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with no end date', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with invalid end date', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-32',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with if end date is before start date', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-31',
          endDate: '2019-01-30',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not  update tax if there is 2 or more taxes configured for a particular day', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-01-31',
          percentage: tPercentage1
        },
        {
          startDate: '2019-02-01',
          endDate: '2019-03-31',
          percentage: tPercentage1
        },
        {
          startDate: '2019-03-30',
          endDate: '2019-05-31',
          percentage: tPercentage1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with empty percentage', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-01-30',
          percentage: ''
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with no percentage', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-01-30',
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with negative percentage', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-01-30',
          percentage: -1
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update tax with invalid percentage', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response = await request(app).put(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-01-30',
          percentage: 'abcd.dd'
        } ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should delete tax with valid id', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    let response = await request(app)['delete'](`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_OK);
    response = await request(app).get(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should handle delete tax with invalid id', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    let response = await request(app)['delete'](`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_OK);
    response = await request(app)['delete'](`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    response = await request(app)['delete'](`${InventoryUris.TAX_URI}/invalidid`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should get a single tax with valid id', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);

    const response1 = await request(app).get(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const tax1: TaxEntity = response1.body;
    expect(tax1.name).toBe('CGST-9');
    expect(tax1.groupName).toBe('CGST');
    expect(tax1.effectiveFrom.length).toBe(1);
    expect(tax1.effectiveFrom[0].percentage).toBe(tPercentage1);
    expect(tax1.effectiveFrom[0].startDate).toBe('2019-01-01');
    expect(tax1.effectiveFrom[0].endDate).toBe('2019-12-31');

  });

  it('Should handle get a single tax with invalid id', async() => {

    const tPercentage1 = 18;

    const response0 = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2019-01-01',
          endDate: '2019-12-31',
          percentage: tPercentage1
        } ]
      });
    expect(response0.status).toBe(HTTP_OK);


    let response = await request(app)['delete'](`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_OK);
    response = await request(app).get(`${InventoryUris.TAX_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    response = await request(app).get(`${InventoryUris.TAX_URI}/someinvald`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

});
