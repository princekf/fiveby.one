/* eslint {max-lines-per-function: 0, max-statements:0, max-lines:0} */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import {UserModel} from '../../auth/user/user.model';
import {UnitModel} from './unit.model';
import { Constants, Unit as UnitEntity, InventoryUris, ProductGroup as ProductGroupEntity, AuthUris, CompanyS as CompanyI } from 'fivebyone';

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
describe(`${InventoryUris.UNIT_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';
  const kilogramDecimalPlaces = 3;
  const THOUSAND = 1000;
  let companyDetails: any;
  let serverTokenAdmin = '';

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
  // Create a sample item
  beforeEach(async() => {
    // TO DO
  });

  // Remove sample items
  afterEach(async() => {

    const Unit = UnitModel.createModel(companyDetails.code);
    await Unit.remove({});

  });


  it('Should save a new unit with valid values', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.UNIT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const savedUnit2: UnitEntity = response1.body;
    expect(savedUnit2.name).toBe('Kilogram');
    expect(savedUnit2.shortName).toBe('kg');
    expect(savedUnit2.decimalPlaces).toBe(kilogramDecimalPlaces);
    expect(savedUnit2.ancestors.length).toBe(0);

  });

  it('Should save a new unit after trim', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: ' Kilogram ',
        shortName: ' kg ',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.UNIT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const savedUnit2: UnitEntity = response1.body;
    expect(savedUnit2.name).toBe('Kilogram');
    expect(savedUnit2.shortName).toBe('kg');
    expect(savedUnit2.decimalPlaces).toBe(kilogramDecimalPlaces);
    expect(savedUnit2.ancestors.length).toBe(0);

  });

  it('Should not save a new unit with invalid token', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer2 ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not save a new unit without token', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not get the saved unit without token', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.UNIT_URI}/${response.body._id}`);
    expect(response1.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not get the saved unit with invaild token', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.UNIT_URI}/${response.body._id}`);
    expect(response1.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not save new unit with empty values', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({});
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save unit with empty name', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: '',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save unit with empty short name', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: '',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product group without name', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product group without decimal places', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product group with duplicate name', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg3',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product group with duplicate short name', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram2',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save unit with invalid base unit', async() => {

    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response2.status).toBe(HTTP_OK);
    const savedUnit2: UnitEntity = response2.body;

    await request(app)['delete'](`${InventoryUris.UNIT_URI}/${savedUnit2._id}`)
      .set('Authorization', `Bearer ${serverToken}`);

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        parent: savedUnit2._id,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save unit with valid base unit.', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedUnit1: UnitEntity = response1.body;

    // Level one parent
    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
        baseUnit: savedUnit1._id,
        times: THOUSAND,
      });
    expect(response2.status).toBe(HTTP_OK);

    const responseG1 = await request(app).get(`${InventoryUris.UNIT_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const savedUnit2: UnitEntity = responseG1.body;
    expect(savedUnit2.name).toBe('Kilogram');
    expect(savedUnit2.shortName).toBe('kg');
    expect(savedUnit2.decimalPlaces).toBe(kilogramDecimalPlaces);
    expect(savedUnit2.times).toBe(THOUSAND);
    expect(savedUnit2.baseUnit.name).toBe(savedUnit1.name);
    expect(savedUnit2.baseUnit.decimalPlaces).toBe(0);
    expect(savedUnit2.ancestors.length).toBe(1);
    expect(savedUnit2.ancestors[0]).toBe(savedUnit1._id);

    // Level two parent
    const response3 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Quintal',
        shortName: 'qt',
        baseUnit: savedUnit2._id,
        times: THOUSAND,
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response3.status).toBe(HTTP_OK);
    const responseG2 = await request(app).get(`${InventoryUris.UNIT_URI}/${response3.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const savedUnit3: UnitEntity = responseG2.body;
    expect(savedUnit3.name).toBe('Quintal');
    expect(savedUnit3.shortName).toBe('qt');
    expect(savedUnit3.times).toBe(THOUSAND);
    expect(savedUnit3.baseUnit.name).toBe(savedUnit2.name);
    const ancestorsLength = 2;
    expect(savedUnit3.ancestors.length).toBe(ancestorsLength);

    expect(savedUnit3.ancestors[0]).toBe(savedUnit1._id);
    expect(savedUnit3.ancestors[1]).toBe(response2.body._id);

  });

  it('Should list all units', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const response = await request(app).get(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_OK);
    const listedUnits: UnitEntity[] = response.body;
    expect(listedUnits.length).toEqual(1);
    expect(listedUnits).toEqual([
      expect.objectContaining({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
        ancestors: [],
      }),
    ]);

  });

  it('Should not list all units without token', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const response = await request(app).get(`${InventoryUris.UNIT_URI}`);
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not list all units with invaild token', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const response = await request(app).get(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer2 ${serverToken}`);
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should get a specific unit by id', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response.status).toBe(HTTP_OK);
    const savedUnit: UnitEntity = response.body;
    const response2 = await request(app).get(`${InventoryUris.UNIT_URI}/${savedUnit._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const savedUnit2: UnitEntity = response2.body;
    expect(savedUnit2).toEqual(
      expect.objectContaining({
        _id: savedUnit._id,
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
        ancestors: [],
      }),
    );

  });

  it('Should not get any unit with invalid id', async() => {

    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response2.status).toBe(HTTP_OK);

    await request(app)['delete'](`${InventoryUris.UNIT_URI}/${response2.body.id}`)
      .set('Authorization', `Bearer ${serverToken}`);

    const response = await request(app).get(`${InventoryUris.UNIT_URI}/${response2.body.id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update unit without token', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);

    const savedUnit1: UnitEntity = response1.body;
    savedUnit1.name = 'Gram-1';
    const response2 = await request(app).put(`${InventoryUris.UNIT_URI}/${savedUnit1._id}`)
      .send(savedUnit1);
    expect(response2.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not update unit with invaild token', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);

    const savedUnit1: UnitEntity = response1.body;
    savedUnit1.name = 'Gram-1';
    const response2 = await request(app).put(`${InventoryUris.UNIT_URI}/${savedUnit1._id}`)
      .set('Authorization', `Bearer2 ${serverToken}`)
      .send(savedUnit1);
    expect(response2.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should update unit with valid values 1', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);

    const savedUnit1: UnitEntity = response1.body;
    savedUnit1.name = 'Gram-1';
    const response2 = await request(app).put(`${InventoryUris.UNIT_URI}/${savedUnit1._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(savedUnit1);
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).get(`${InventoryUris.UNIT_URI}/${savedUnit1._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const savedUnit2: UnitEntity = response3.body;
    expect(savedUnit2).toEqual(
      expect.objectContaining({
        _id: savedUnit1._id,
        name: 'Gram-1',
        shortName: 'gm',
        decimalPlaces: 0,
        ancestors: [],
      }),
    );

  });

  it('Should update unit with valid values', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedUnit1: UnitEntity = response1.body;
    const response2 = await request(app).put(`${InventoryUris.UNIT_URI}/${savedUnit1._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: ' Gram-1 ',
        shortName: ' gm1 ',
      });
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).get(`${InventoryUris.UNIT_URI}/${savedUnit1._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const savedUnit2: UnitEntity = response3.body;
    expect(savedUnit2).toEqual(
      expect.objectContaining({
        _id: savedUnit1._id,
        name: 'Gram-1',
        shortName: 'gm1',
        decimalPlaces: 0,
        ancestors: [],
      }),
    );

  });

  it('Should update unit with valid base unit', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedUnit1: UnitEntity = response1.body;

    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response2.status).toBe(HTTP_OK);
    const savedUnit2: UnitEntity = response2.body;

    const response3 = await request(app).put(`${InventoryUris.UNIT_URI}/${savedUnit2._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram-2',
        baseUnit: savedUnit1,
        times: THOUSAND,
      });
    expect(response3.status).toBe(HTTP_OK);

    const response4 = await request(app).get(`${InventoryUris.UNIT_URI}/${savedUnit2._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_OK);
    const savedUnit4: UnitEntity = response4.body;
    expect(savedUnit4.name).toBe('Kilogram-2');
    expect(savedUnit4.shortName).toBe('kg');
    expect(savedUnit4.decimalPlaces).toBe(kilogramDecimalPlaces);
    expect(savedUnit4.times).toBe(THOUSAND);
    expect(savedUnit4.baseUnit.name).toBe(savedUnit1.name);
    expect(savedUnit4.ancestors.length).toBe(1);
    expect(savedUnit4.ancestors[0]).toBe(savedUnit1._id);

  });

  it('Should update unit with valid id of base unit', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedUnit1: UnitEntity = response1.body;

    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response2.status).toBe(HTTP_OK);
    const savedUnit2: UnitEntity = response2.body;

    const response3 = await request(app).put(`${InventoryUris.UNIT_URI}/${savedUnit2._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram 1',
        baseUnit: savedUnit1._id,
        times: THOUSAND,
      });
    expect(response3.status).toBe(HTTP_OK);

    const response4 = await request(app).get(`${InventoryUris.UNIT_URI}/${savedUnit2._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_OK);
    const savedUnit4: UnitEntity = response4.body;
    expect(savedUnit4.name).toBe('Kilogram 1');
    expect(savedUnit4.times).toBe(THOUSAND);
    expect(savedUnit4.baseUnit.name).toBe(savedUnit1.name);
    expect(savedUnit4.ancestors.length).toBe(1);
    expect(savedUnit4.ancestors[0]).toBe(savedUnit1._id);

  });

  it('cant update unit if there is circular relation with base unit', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);

    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
        times: THOUSAND,
        baseUnit: response1.body._id,
      });
    expect(response2.status).toBe(HTTP_OK);
    const responseG1 = await request(app).get(`${InventoryUris.UNIT_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const savedUnit2: UnitEntity = responseG1.body;
    expect(savedUnit2.baseUnit.name).toBe('Gram');
    expect(savedUnit2.ancestors.length).toBe(1);
    expect(savedUnit2.ancestors[0]).toBe(response1.body._id);

    const response3 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Qunital',
        shortName: 'qt',
        decimalPlaces: kilogramDecimalPlaces,
        times: THOUSAND,
        baseUnit: response2.body._id,
      });
    expect(response3.status).toBe(HTTP_OK);
    const responseG2 = await request(app).get(`${InventoryUris.UNIT_URI}/${response3.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const savedUnit3: UnitEntity = responseG2.body;
    expect(savedUnit3.baseUnit.name).toBe('Kilogram');
    const ancestorsLength = 2;
    expect(savedUnit3.ancestors.length).toBe(ancestorsLength);
    expect(savedUnit3.ancestors[0]).toBe(response1.body._id);
    expect(savedUnit3.ancestors[1]).toBe(response2.body._id);

    const response4 = await request(app).put(`${InventoryUris.UNIT_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram-New',
        baseUnit: savedUnit3,
      });
    expect(response4.status).toBe(HTTP_BAD_REQUEST);
    const responseG3 = await request(app).get(`${InventoryUris.UNIT_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const savedUnit1New: UnitEntity = responseG3.body;

    expect(savedUnit1New.name).toBe('Gram');
    expect(savedUnit1New.ancestors.length).toBe(0);
    expect(!savedUnit1New.baseUnit).toBe(true);

  });

  it('Should not update unit with invalid parent', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    expect(response2.status).toBe(HTTP_OK);
    const response4 = await request(app).get(`${InventoryUris.UNIT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_OK);
    const savedUnit4: UnitEntity = response4.body;
    await request(app)['delete'](`${InventoryUris.UNIT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);

    const response3 = await request(app).put(`${InventoryUris.UNIT_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram-1',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
        baseUnit: savedUnit4,
      });
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update unit with duplicate name', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram-2',
        shortName: 'gm-2',
        decimalPlaces: 0,
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).put(`${InventoryUris.UNIT_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm-23',
        decimalPlaces: 0,
      });
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should remove base unit by updating unit', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedUnit1: UnitEntity = response1.body;
    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
        times: THOUSAND,
        baseUnit: savedUnit1
      });
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).get(`${InventoryUris.UNIT_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const savedUnit2: UnitEntity = response3.body;
    expect(savedUnit2.name).toBe('Kilogram');
    expect(savedUnit2.baseUnit.name).toBe('Gram');

    const response4 = await request(app).put(`${InventoryUris.UNIT_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
        times: THOUSAND,
        baseUnit: null,
      });
    expect(response4.status).toBe(HTTP_OK);
    const response5 = await request(app).get(`${InventoryUris.UNIT_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);

    expect(response5.status).toBe(HTTP_OK);
    const updatedUnit2: UnitEntity = response5.body;
    expect(updatedUnit2.name).toBe('Kilogram');
    expect(!updatedUnit2.baseUnit).toBe(true);
    expect(updatedUnit2.ancestors.length).toBe(0);

  });

  it('Should not delete unit if it is a baseunit.', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedUnit1: UnitEntity = response1.body;
    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
        times: THOUSAND,
        baseUnit: savedUnit1
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app)['delete'](`${InventoryUris.UNIT_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not delete unit with invaild token.', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const response3 = await request(app)['delete'](`${InventoryUris.UNIT_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer2 ${serverToken}`);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not delete unit without token.', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const response3 = await request(app)['delete'](`${InventoryUris.UNIT_URI}/${response1.body._id}`);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Ancestors should be changed when a base unit is changed.', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedUnit1: UnitEntity = response1.body;
    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
        times: THOUSAND,
        baseUnit: savedUnit1
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram2',
        shortName: 'gm2',
        decimalPlaces: 2,
      });
    expect(response3.status).toBe(HTTP_OK);
    const savedUnit3: UnitEntity = response3.body;

    const response4 = await request(app).put(`${InventoryUris.UNIT_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram-2',
        shortName: 'kg-2',
        decimalPlaces: kilogramDecimalPlaces,
        times: THOUSAND,
        baseUnit: savedUnit3
      });
    expect(response4.status).toBe(HTTP_OK);

    const response5 = await request(app).get(`${InventoryUris.UNIT_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response5.status).toBe(HTTP_OK);
    const updatedUnit: UnitEntity = response5.body;
    expect(updatedUnit.name).toBe('Kilogram-2');
    expect(updatedUnit.baseUnit.name).toBe('Gram2');
    expect(updatedUnit.ancestors.length).toBe(1);
    expect(updatedUnit.ancestors[0]).toBe(response3.body._id);

  });

  it('Should delete unit with valid id', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response.status).toBe(HTTP_OK);
    const savedUnit: UnitEntity = response.body;

    const response3 = await request(app)['delete'](`${InventoryUris.UNIT_URI}/${savedUnit._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);

    const response4 = await request(app).get(`${InventoryUris.UNIT_URI}/${savedUnit._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should handle delete of unit with invalid id', async() => {

    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app)['delete'](`${InventoryUris.UNIT_URI}/${response2.body.id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not delete a parent when a child deletes', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedUnit: UnitEntity = response1.body;

    const response2 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
        times: THOUSAND,
        baseUnit: savedUnit,
      });
    expect(response2.status).toBe(HTTP_OK);
    const responseG1 = await request(app).get(`${InventoryUris.UNIT_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const savedUnit2: UnitEntity = responseG1.body;
    expect(savedUnit2.ancestors.length).toBe(1);
    expect(savedUnit2.baseUnit.name).toBe('Gram');

    await request(app)['delete'](`${InventoryUris.UNIT_URI}/${response2.body.id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const response4 = await request(app).get(`${InventoryUris.UNIT_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const unitAfterDeleteChild: UnitEntity = response4.body;
    expect(response4.status).toBe(HTTP_OK);
    expect(unitAfterDeleteChild.name).toBe('Gram');

  });

  it('Should not delete a unit if it is assigned to a product', async() => {

    const response1 = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 0,
      });
    expect(response1.status).toBe(HTTP_OK);
    const response2 = await request(app).get(`${InventoryUris.UNIT_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const savedUnit: UnitEntity = response2.body;

    const responseG1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 1',
        shortName: 'Short Name 1',
      });
    expect(responseG1.status).toBe(HTTP_OK);
    const responseG2 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${responseG1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(responseG2.status).toBe(HTTP_OK);
    const savedProductGroup: ProductGroupEntity = responseG2.body;

    const response3 = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: savedProductGroup,
        unit: savedUnit,
        name: 'Product One',
        shortName: 'Short Name 1',
      });
    expect(response3.status).toBe(HTTP_OK);

    const response4 = await request(app)['delete'](`${InventoryUris.UNIT_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_BAD_REQUEST);

  });


  it('Should not save if decimal places outside the range 0 - 3', async() => {

    let response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 4,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

    response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: -1,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save if decimal places is not an interger', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 2.5,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);


  });

  it('Should not update if decimal places is not an interger', async() => {

    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 2,
      });
    expect(response.status).toBe(HTTP_OK);


    const response1 = await request(app).put(`${InventoryUris.UNIT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Gram',
        shortName: 'gm',
        decimalPlaces: 2.5,
      });
    expect(response1.status).toBe(HTTP_BAD_REQUEST);

  });

});
