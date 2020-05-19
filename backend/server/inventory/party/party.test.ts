/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import User from '../../users/user.model';
import Party from './party.model';
import {Constants, Party as PartyEntity, InventoryUris} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

describe(`${InventoryUris.PARTY_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';

  // Connect to mongoose mock, create a test user and get the access token
  beforeAll(async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });
    const user = new User();
    user.email = 'test@email.com';
    user.setPassword('test-password');
    await user.save();
    const response = await request(app).post('/api/users/login')
      .send({
        email: 'test@email.com',
        password: 'test-password',
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


  // Remove sample items
  afterEach(async() => {

    await Party.remove({});

  });

  it('Should save party with valid values.', async() => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const party1: PartyEntity = response1.body;
    expect(party1.name).toBe('John Honai');
    expect(party1.code).toBe('JNHN');
    expect(party1.mobile).toBe('+91123456789');
    expect(party1.email).toBe('john.honai@fiveby.one');
    expect(party1.isCustomer).toBe(true);
    expect(party1.isVendor).toBe(false);
    expect(party1.adresses.length).toBe(1);
    expect(party1.adresses[0].type).toBe('billing');
    expect(party1.adresses[0].addressLine1).toBe('36-B, Orchid Villa');
    expect(party1.adresses[0].addressLine2).toBe('Harihar Nagar');
    expect(party1.adresses[0].addressLine3).toBe('Pathalam');
    expect(party1.adresses[0].addressLine4).toBe('Kochi');
    expect(party1.adresses[0].state).toBe('Kerala');
    expect(party1.adresses[0].country).toBe('India');
    expect(party1.adresses[0].pinCode).toBe('682001');
    expect(party1.adresses[0].landMark).toBe('Behind EMS Library');
    expect(party1.registrationNumbers.length).toBe(1);
    expect(party1.registrationNumbers[0].name).toBe('GST Number');
    expect(party1.registrationNumbers[0].value).toBe('AABBCCDDEEFF');

  });

  it('Should save party with minimum valid values.', async() => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const party1: PartyEntity = response1.body;

    expect(party1.name).toBe('John Honai');
    expect(party1.code).toBe('JNHN');
    expect(party1.mobile).toBe('+91123456789');
    expect(party1.email).toBe('john.honai@fiveby.one');
    expect(party1.isCustomer).toBe(true);
    expect(party1.isVendor).toBe(false);
    expect(party1.adresses.length).toBe(1);
    expect(!party1.adresses[0].type).toBe(true);
    expect(party1.adresses[0].addressLine1).toBe('36-B, Orchid Villa');
    expect(party1.adresses[0].addressLine2).toBe('Harihar Nagar');
    expect(!party1.adresses[0].addressLine3).toBe(true);
    expect(!party1.adresses[0].addressLine4).toBe(true);
    expect(party1.adresses[0].state).toBe('Kerala');
    expect(party1.adresses[0].country).toBe('India');
    expect(party1.adresses[0].pinCode).toBe('682001');
    expect(!party1.adresses[0].landMark).toBe(true);
    expect(party1.registrationNumbers.length).toBe(0);

  });

  it('Should not save with empty name.', async() => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: '',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save with no name.', async() => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save with duplicate code.', async() => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai2',
        code: 'JNHN',
        mobile: '+911234567892',
        email: 'john.honai@fiveby.one2',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
          }
        ]
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save party with empty code.', async() => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: '  ',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should save 2 partys without code.', async() => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai2',
        mobile: '+911234567892',
        email: 'john.honai2@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
          }
        ]
      });
    expect(response2.status).toBe(HTTP_OK);

  });

  it('Should not save with empty address.', async() => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        mobile: '+91123456789',
        code: 'JNHN',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: []
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not save with no address.', async() => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        mobile: '+91123456789',
        code: 'JNHN',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should save with 2 addresses.', async() => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          },
          {
            type: 'delivery',
            addressLine1: '36-C, Orchid Villa',
            addressLine2: 'Harihar Valley',
            addressLine3: 'Chekuthanmukku',
            addressLine4: 'Kothamangalam',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const party1: PartyEntity = response1.body;
    expect(party1.name).toBe('John Honai');
    expect(party1.code).toBe('JNHN');
    expect(party1.mobile).toBe('+91123456789');
    expect(party1.email).toBe('john.honai@fiveby.one');
    expect(party1.isCustomer).toBe(true);
    expect(party1.isVendor).toBe(false);
    const addressLength = 2;
    expect(party1.adresses.length).toBe(addressLength);
    expect(party1.adresses[0].type).toBe('billing');
    expect(party1.adresses[0].addressLine1).toBe('36-B, Orchid Villa');
    expect(party1.adresses[0].addressLine2).toBe('Harihar Nagar');
    expect(party1.adresses[0].addressLine3).toBe('Pathalam');
    expect(party1.adresses[0].addressLine4).toBe('Kochi');
    expect(party1.adresses[0].state).toBe('Kerala');
    expect(party1.adresses[0].country).toBe('India');
    expect(party1.adresses[0].pinCode).toBe('682001');
    expect(party1.adresses[0].landMark).toBe('Behind EMS Library');

    expect(party1.adresses[1].type).toBe('delivery');
    expect(party1.adresses[1].addressLine1).toBe('36-C, Orchid Villa');
    expect(party1.adresses[1].addressLine2).toBe('Harihar Valley');
    expect(party1.adresses[1].addressLine3).toBe('Chekuthanmukku');
    expect(party1.adresses[1].addressLine4).toBe('Kothamangalam');
    expect(party1.adresses[1].state).toBe('Kerala');
    expect(party1.adresses[1].country).toBe('India');
    expect(party1.adresses[1].pinCode).toBe('682001');
    expect(party1.adresses[1].landMark).toBe('Behind EMS Library');
    expect(party1.registrationNumbers.length).toBe(1);
    expect(party1.registrationNumbers[0].name).toBe('GST Number');
    expect(party1.registrationNumbers[0].value).toBe('AABBCCDDEEFF');

  });
  it('Should save with 2 registrations.', async() => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          },
          {
            type: 'delivery',
            addressLine1: '36-C, Orchid Villa',
            addressLine2: 'Harihar Valley',
            addressLine3: 'Chekuthanmukku',
            addressLine4: 'Kothamangalam',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          },
          {
            name: 'PAN Number',
            value: 'ZYSXOP'
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const party1: PartyEntity = response1.body;
    expect(party1.name).toBe('John Honai');
    expect(party1.code).toBe('JNHN');
    expect(party1.mobile).toBe('+91123456789');
    expect(party1.email).toBe('john.honai@fiveby.one');
    expect(party1.isCustomer).toBe(true);
    expect(party1.isVendor).toBe(false);
    const addressLength = 2;
    expect(party1.adresses.length).toBe(addressLength);
    expect(party1.adresses[0].type).toBe('billing');
    expect(party1.adresses[0].addressLine1).toBe('36-B, Orchid Villa');
    expect(party1.adresses[0].addressLine2).toBe('Harihar Nagar');
    expect(party1.adresses[0].addressLine3).toBe('Pathalam');
    expect(party1.adresses[0].addressLine4).toBe('Kochi');
    expect(party1.adresses[0].state).toBe('Kerala');
    expect(party1.adresses[0].country).toBe('India');
    expect(party1.adresses[0].pinCode).toBe('682001');
    expect(party1.adresses[0].landMark).toBe('Behind EMS Library');

    expect(party1.adresses[1].type).toBe('delivery');
    expect(party1.adresses[1].addressLine1).toBe('36-C, Orchid Villa');
    expect(party1.adresses[1].addressLine2).toBe('Harihar Valley');
    expect(party1.adresses[1].addressLine3).toBe('Chekuthanmukku');
    expect(party1.adresses[1].addressLine4).toBe('Kothamangalam');
    expect(party1.adresses[1].state).toBe('Kerala');
    expect(party1.adresses[1].country).toBe('India');
    expect(party1.adresses[1].pinCode).toBe('682001');
    expect(party1.adresses[1].landMark).toBe('Behind EMS Library');
    const regLength = 2;
    expect(party1.registrationNumbers.length).toBe(regLength);
    expect(party1.registrationNumbers[0].name).toBe('GST Number');
    expect(party1.registrationNumbers[0].value).toBe('AABBCCDDEEFF');
    expect(party1.registrationNumbers[1].name).toBe('PAN Number');
    expect(party1.registrationNumbers[1].value).toBe('ZYSXOP');

  });

  it('Should update party with valid values.', async() => {

    const response0 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN0',
        mobile: '+911234567890',
        email: 'john.honai@fiveby.one0',
        isCustomer: false,
        isVendor: true,
        adresses: [
          {
            type: 'billing0',
            addressLine1: '36-B, Orchid Villa0',
            addressLine2: 'Harihar Nagar0',
            addressLine3: 'Pathalam0',
            addressLine4: 'Kochi0',
            state: 'Kerala0',
            country: 'India0',
            pinCode: '6820010',
            landMark: 'Behind EMS Library0'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number0',
            value: 'AABBCCDDEEFF0'
          }
        ]
      });
    expect(response0.status).toBe(HTTP_OK);
    const response = await request(app).put(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const party1: PartyEntity = response1.body;
    expect(party1.name).toBe('John Honai');
    expect(party1.code).toBe('JNHN');
    expect(party1.mobile).toBe('+91123456789');
    expect(party1.email).toBe('john.honai@fiveby.one');
    expect(party1.isCustomer).toBe(true);
    expect(party1.isVendor).toBe(false);
    expect(party1.adresses.length).toBe(1);
    expect(party1.adresses[0].type).toBe('billing');
    expect(party1.adresses[0].addressLine1).toBe('36-B, Orchid Villa');
    expect(party1.adresses[0].addressLine2).toBe('Harihar Nagar');
    expect(party1.adresses[0].addressLine3).toBe('Pathalam');
    expect(party1.adresses[0].addressLine4).toBe('Kochi');
    expect(party1.adresses[0].state).toBe('Kerala');
    expect(party1.adresses[0].country).toBe('India');
    expect(party1.adresses[0].pinCode).toBe('682001');
    expect(party1.adresses[0].landMark).toBe('Behind EMS Library');
    expect(party1.registrationNumbers.length).toBe(1);
    expect(party1.registrationNumbers[0].name).toBe('GST Number');
    expect(party1.registrationNumbers[0].value).toBe('AABBCCDDEEFF');

  });
  it('Should not update with empty name.', async() => {

    const response0 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN0',
        mobile: '+911234567890',
        email: 'john.honai@fiveby.one0',
        isCustomer: false,
        isVendor: true,
        adresses: [
          {
            type: 'billing0',
            addressLine1: '36-B, Orchid Villa0',
            addressLine2: 'Harihar Nagar0',
            addressLine3: 'Pathalam0',
            addressLine4: 'Kochi0',
            state: 'Kerala0',
            country: 'India0',
            pinCode: '6820010',
            landMark: 'Behind EMS Library0'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number0',
            value: 'AABBCCDDEEFF0'
          }
        ]
      });
    expect(response0.status).toBe(HTTP_OK);
    const response = await request(app).put(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: '   ',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update with no name.', async() => {

    const response0 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN0',
        mobile: '+911234567890',
        email: 'john.honai@fiveby.one0',
        isCustomer: false,
        isVendor: true,
        adresses: [
          {
            type: 'billing0',
            addressLine1: '36-B, Orchid Villa0',
            addressLine2: 'Harihar Nagar0',
            addressLine3: 'Pathalam0',
            addressLine4: 'Kochi0',
            state: 'Kerala0',
            country: 'India0',
            pinCode: '6820010',
            landMark: 'Behind EMS Library0'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number0',
            value: 'AABBCCDDEEFF0'
          }
        ]
      });
    expect(response0.status).toBe(HTTP_OK);
    const response = await request(app).put(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: null,
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update with duplicate code.', async() => {

    const response0 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN0',
        mobile: '+911234567890',
        email: 'john.honai@fiveby.one0',
        isCustomer: false,
        isVendor: true,
        adresses: [
          {
            type: 'billing0',
            addressLine1: '36-B, Orchid Villa0',
            addressLine2: 'Harihar Nagar0',
            addressLine3: 'Pathalam0',
            addressLine4: 'Kochi0',
            state: 'Kerala0',
            country: 'India0',
            pinCode: '6820010',
            landMark: 'Behind EMS Library0'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number0',
            value: 'AABBCCDDEEFF0'
          }
        ]
      });
    expect(response0.status).toBe(HTTP_OK);
    const response1 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai1',
        code: 'JNHN1',
        mobile: '+911234567891',
        email: 'john.honai@fiveby.one1',
        isCustomer: false,
        isVendor: true,
        adresses: [
          {
            type: 'billing1',
            addressLine1: '36-B, Orchid Villa1',
            addressLine2: 'Harihar Nagar1',
            addressLine3: 'Pathalam1',
            addressLine4: 'Kochi1',
            state: 'Kerala1',
            country: 'India1',
            pinCode: '6820011',
            landMark: 'Behind EMS Library1'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number1',
            value: 'AABBCCDDEEFF1'
          }
        ]
      });
    expect(response1.status).toBe(HTTP_OK);
    const response2 = await request(app).put(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN1',
        mobile: '+911234567890',
        email: 'john.honai@fiveby.one0',
        isCustomer: false,
        isVendor: true,
        adresses: [
          {
            type: 'billing0',
            addressLine1: '36-B, Orchid Villa0',
            addressLine2: 'Harihar Nagar0',
            addressLine3: 'Pathalam0',
            addressLine4: 'Kochi0',
            state: 'Kerala0',
            country: 'India0',
            pinCode: '6820010',
            landMark: 'Behind EMS Library0'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number0',
            value: 'AABBCCDDEEFF0'
          }
        ]
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should update party with empty code.', async() => {

    const response0 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN0',
        mobile: '+911234567890',
        email: 'john.honai@fiveby.one0',
        isCustomer: false,
        isVendor: true,
        adresses: [
          {
            type: 'billing0',
            addressLine1: '36-B, Orchid Villa0',
            addressLine2: 'Harihar Nagar0',
            addressLine3: 'Pathalam0',
            addressLine4: 'Kochi0',
            state: 'Kerala0',
            country: 'India0',
            pinCode: '6820010',
            landMark: 'Behind EMS Library0'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number0',
            value: 'AABBCCDDEEFF0'
          }
        ]
      });
    expect(response0.status).toBe(HTTP_OK);
    const response = await request(app).put(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: '   ',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should update party without code.', async() => {

    const response0 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN0',
        mobile: '+911234567890',
        email: 'john.honai@fiveby.one0',
        isCustomer: false,
        isVendor: true,
        adresses: [
          {
            type: 'billing0',
            addressLine1: '36-B, Orchid Villa0',
            addressLine2: 'Harihar Nagar0',
            addressLine3: 'Pathalam0',
            addressLine4: 'Kochi0',
            state: 'Kerala0',
            country: 'India0',
            pinCode: '6820010',
            landMark: 'Behind EMS Library0'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number0',
            value: 'AABBCCDDEEFF0'
          }
        ]
      });
    expect(response0.status).toBe(HTTP_OK);
    const response = await request(app).put(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: null,
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update with empty address.', async() => {

    const response0 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN0',
        mobile: '+911234567890',
        email: 'john.honai@fiveby.one0',
        isCustomer: false,
        isVendor: true,
        adresses: [
          {
            type: 'billing0',
            addressLine1: '36-B, Orchid Villa0',
            addressLine2: 'Harihar Nagar0',
            addressLine3: 'Pathalam0',
            addressLine4: 'Kochi0',
            state: 'Kerala0',
            country: 'India0',
            pinCode: '6820010',
            landMark: 'Behind EMS Library0'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number0',
            value: 'AABBCCDDEEFF0'
          }
        ]
      });
    expect(response0.status).toBe(HTTP_OK);
    const response = await request(app).put(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN0',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should not update with no address.', async() => {

    const response0 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN0',
        mobile: '+911234567890',
        email: 'john.honai@fiveby.one0',
        isCustomer: false,
        isVendor: true,
        adresses: [
          {
            type: 'billing0',
            addressLine1: '36-B, Orchid Villa0',
            addressLine2: 'Harihar Nagar0',
            addressLine3: 'Pathalam0',
            addressLine4: 'Kochi0',
            state: 'Kerala0',
            country: 'India0',
            pinCode: '6820010',
            landMark: 'Behind EMS Library0'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number0',
            value: 'AABBCCDDEEFF0'
          }
        ]
      });
    expect(response0.status).toBe(HTTP_OK);
    const response = await request(app).put(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN0',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: null,
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should update with 2 addresses.', async() => {

    const response0 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN0',
        mobile: '+911234567890',
        email: 'john.honai@fiveby.one0',
        isCustomer: false,
        isVendor: true,
        adresses: [
          {
            type: 'billing0',
            addressLine1: '36-B, Orchid Villa0',
            addressLine2: 'Harihar Nagar0',
            addressLine3: 'Pathalam0',
            addressLine4: 'Kochi0',
            state: 'Kerala0',
            country: 'India0',
            pinCode: '6820010',
            landMark: 'Behind EMS Library0'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number0',
            value: 'AABBCCDDEEFF0'
          }
        ]
      });
    expect(response0.status).toBe(HTTP_OK);
    const response = await request(app).put(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          },
          {
            type: 'delivery',
            addressLine1: '36-C, Orchid Villa',
            addressLine2: 'Harihar Valley',
            addressLine3: 'Monvila',
            addressLine4: 'Trivandrum',
            state: 'Kerala',
            country: 'India',
            pinCode: '689007',
            landMark: 'Near AKG Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const party1: PartyEntity = response1.body;
    expect(party1.name).toBe('John Honai');
    expect(party1.code).toBe('JNHN');
    expect(party1.mobile).toBe('+91123456789');
    expect(party1.email).toBe('john.honai@fiveby.one');
    expect(party1.isCustomer).toBe(true);
    expect(party1.isVendor).toBe(false);
    const addressLength = 2;
    expect(party1.adresses.length).toBe(addressLength);
    expect(party1.adresses[0].type).toBe('billing');
    expect(party1.adresses[0].addressLine1).toBe('36-B, Orchid Villa');
    expect(party1.adresses[0].addressLine2).toBe('Harihar Nagar');
    expect(party1.adresses[0].addressLine3).toBe('Pathalam');
    expect(party1.adresses[0].addressLine4).toBe('Kochi');
    expect(party1.adresses[0].state).toBe('Kerala');
    expect(party1.adresses[0].country).toBe('India');
    expect(party1.adresses[0].pinCode).toBe('682001');
    expect(party1.adresses[0].landMark).toBe('Behind EMS Library');

    expect(party1.adresses[1].type).toBe('delivery');
    expect(party1.adresses[1].addressLine1).toBe('36-C, Orchid Villa');
    expect(party1.adresses[1].addressLine2).toBe('Harihar Valley');
    expect(party1.adresses[1].addressLine3).toBe('Monvila');
    expect(party1.adresses[1].addressLine4).toBe('Trivandrum');
    expect(party1.adresses[1].state).toBe('Kerala');
    expect(party1.adresses[1].country).toBe('India');
    expect(party1.adresses[1].pinCode).toBe('689007');
    expect(party1.adresses[1].landMark).toBe('Near AKG Library');
    expect(party1.registrationNumbers.length).toBe(1);
    expect(party1.registrationNumbers[0].name).toBe('GST Number');
    expect(party1.registrationNumbers[0].value).toBe('AABBCCDDEEFF');

  });
  it('Should update with 2 registrations.', async() => {

    const response0 = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai0',
        code: 'JNHN0',
        mobile: '+911234567890',
        email: 'john.honai@fiveby.one0',
        isCustomer: false,
        isVendor: true,
        adresses: [
          {
            type: 'billing0',
            addressLine1: '36-B, Orchid Villa0',
            addressLine2: 'Harihar Nagar0',
            addressLine3: 'Pathalam0',
            addressLine4: 'Kochi0',
            state: 'Kerala0',
            country: 'India0',
            pinCode: '6820010',
            landMark: 'Behind EMS Library0'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number0',
            value: 'AABBCCDDEEFF0'
          }
        ]
      });
    expect(response0.status).toBe(HTTP_OK);
    const response = await request(app).put(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          },
          {
            type: 'delivery',
            addressLine1: '36-C, Orchid Villa',
            addressLine2: 'Harihar Valley',
            addressLine3: 'Monvila',
            addressLine4: 'Trivandrum',
            state: 'Kerala',
            country: 'India',
            pinCode: '689007',
            landMark: 'Near AKG Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          },
          {
            name: 'PAN Number',
            value: 'XYSOP'
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response0.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const party1: PartyEntity = response1.body;
    expect(party1.name).toBe('John Honai');
    expect(party1.code).toBe('JNHN');
    expect(party1.mobile).toBe('+91123456789');
    expect(party1.email).toBe('john.honai@fiveby.one');
    expect(party1.isCustomer).toBe(true);
    expect(party1.isVendor).toBe(false);
    const addressLength = 2;
    expect(party1.adresses.length).toBe(addressLength);
    expect(party1.adresses[0].type).toBe('billing');
    expect(party1.adresses[0].addressLine1).toBe('36-B, Orchid Villa');
    expect(party1.adresses[0].addressLine2).toBe('Harihar Nagar');
    expect(party1.adresses[0].addressLine3).toBe('Pathalam');
    expect(party1.adresses[0].addressLine4).toBe('Kochi');
    expect(party1.adresses[0].state).toBe('Kerala');
    expect(party1.adresses[0].country).toBe('India');
    expect(party1.adresses[0].pinCode).toBe('682001');
    expect(party1.adresses[0].landMark).toBe('Behind EMS Library');

    expect(party1.adresses[1].type).toBe('delivery');
    expect(party1.adresses[1].addressLine1).toBe('36-C, Orchid Villa');
    expect(party1.adresses[1].addressLine2).toBe('Harihar Valley');
    expect(party1.adresses[1].addressLine3).toBe('Monvila');
    expect(party1.adresses[1].addressLine4).toBe('Trivandrum');
    expect(party1.adresses[1].state).toBe('Kerala');
    expect(party1.adresses[1].country).toBe('India');
    expect(party1.adresses[1].pinCode).toBe('689007');
    expect(party1.adresses[1].landMark).toBe('Near AKG Library');
    const regLength = 2;
    expect(party1.registrationNumbers.length).toBe(regLength);
    expect(party1.registrationNumbers[0].name).toBe('GST Number');
    expect(party1.registrationNumbers[0].value).toBe('AABBCCDDEEFF');
    expect(party1.registrationNumbers[1].name).toBe('PAN Number');
    expect(party1.registrationNumbers[1].value).toBe('XYSOP');

  });
  it('Should list empty if no party.', async() => {

    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const partys: PartyEntity[] = response1.body;
    expect(partys.length).toBe(0);

  });
  it('Should list all partys.', async() => {

    const response = await request(app).post(`${InventoryUris.PARTY_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          },
          {
            type: 'delivery',
            addressLine1: '36-C, Orchid Villa',
            addressLine2: 'Harihar Valley',
            addressLine3: 'Monvila',
            addressLine4: 'Trivandrum',
            state: 'Kerala',
            country: 'India',
            pinCode: '689007',
            landMark: 'Near AKG Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          },
          {
            name: 'PAN Number',
            value: 'XYSOP'
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const partys: PartyEntity[] = response1.body;
    expect(partys.length).toBe(1);
    const [ party1 ] = partys;
    expect(party1.name).toBe('John Honai');
    expect(party1.code).toBe('JNHN');
    expect(party1.mobile).toBe('+91123456789');
    expect(party1.email).toBe('john.honai@fiveby.one');
    expect(party1.isCustomer).toBe(true);
    expect(party1.isVendor).toBe(false);
    const addressLength = 2;
    expect(party1.adresses.length).toBe(addressLength);
    expect(party1.adresses[0].type).toBe('billing');
    expect(party1.adresses[0].addressLine1).toBe('36-B, Orchid Villa');
    expect(party1.adresses[0].addressLine2).toBe('Harihar Nagar');
    expect(party1.adresses[0].addressLine3).toBe('Pathalam');
    expect(party1.adresses[0].addressLine4).toBe('Kochi');
    expect(party1.adresses[0].state).toBe('Kerala');
    expect(party1.adresses[0].country).toBe('India');
    expect(party1.adresses[0].pinCode).toBe('682001');
    expect(party1.adresses[0].landMark).toBe('Behind EMS Library');

    expect(party1.adresses[1].type).toBe('delivery');
    expect(party1.adresses[1].addressLine1).toBe('36-C, Orchid Villa');
    expect(party1.adresses[1].addressLine2).toBe('Harihar Valley');
    expect(party1.adresses[1].addressLine3).toBe('Monvila');
    expect(party1.adresses[1].addressLine4).toBe('Trivandrum');
    expect(party1.adresses[1].state).toBe('Kerala');
    expect(party1.adresses[1].country).toBe('India');
    expect(party1.adresses[1].pinCode).toBe('689007');
    expect(party1.adresses[1].landMark).toBe('Near AKG Library');
    const regLength = 2;
    expect(party1.registrationNumbers.length).toBe(regLength);
    expect(party1.registrationNumbers[0].name).toBe('GST Number');
    expect(party1.registrationNumbers[0].value).toBe('AABBCCDDEEFF');
    expect(party1.registrationNumbers[1].name).toBe('PAN Number');
    expect(party1.registrationNumbers[1].value).toBe('XYSOP');

  });
  it('Should get party with valid id.', async() => {

    const response = await request(app).post(`${InventoryUris.PARTY_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          },
          {
            type: 'delivery',
            addressLine1: '36-C, Orchid Villa',
            addressLine2: 'Harihar Valley',
            addressLine3: 'Monvila',
            addressLine4: 'Trivandrum',
            state: 'Kerala',
            country: 'India',
            pinCode: '689007',
            landMark: 'Near AKG Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          },
          {
            name: 'PAN Number',
            value: 'XYSOP'
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_OK);
    const party1: PartyEntity = response1.body;
    expect(party1.name).toBe('John Honai');
    expect(party1.code).toBe('JNHN');
    expect(party1.mobile).toBe('+91123456789');
    expect(party1.email).toBe('john.honai@fiveby.one');
    expect(party1.isCustomer).toBe(true);
    expect(party1.isVendor).toBe(false);
    const addressLength = 2;
    expect(party1.adresses.length).toBe(addressLength);
    expect(party1.adresses[0].type).toBe('billing');
    expect(party1.adresses[0].addressLine1).toBe('36-B, Orchid Villa');
    expect(party1.adresses[0].addressLine2).toBe('Harihar Nagar');
    expect(party1.adresses[0].addressLine3).toBe('Pathalam');
    expect(party1.adresses[0].addressLine4).toBe('Kochi');
    expect(party1.adresses[0].state).toBe('Kerala');
    expect(party1.adresses[0].country).toBe('India');
    expect(party1.adresses[0].pinCode).toBe('682001');
    expect(party1.adresses[0].landMark).toBe('Behind EMS Library');

    expect(party1.adresses[1].type).toBe('delivery');
    expect(party1.adresses[1].addressLine1).toBe('36-C, Orchid Villa');
    expect(party1.adresses[1].addressLine2).toBe('Harihar Valley');
    expect(party1.adresses[1].addressLine3).toBe('Monvila');
    expect(party1.adresses[1].addressLine4).toBe('Trivandrum');
    expect(party1.adresses[1].state).toBe('Kerala');
    expect(party1.adresses[1].country).toBe('India');
    expect(party1.adresses[1].pinCode).toBe('689007');
    expect(party1.adresses[1].landMark).toBe('Near AKG Library');
    const regLength = 2;
    expect(party1.registrationNumbers.length).toBe(regLength);
    expect(party1.registrationNumbers[0].name).toBe('GST Number');
    expect(party1.registrationNumbers[0].value).toBe('AABBCCDDEEFF');
    expect(party1.registrationNumbers[1].name).toBe('PAN Number');
    expect(party1.registrationNumbers[1].value).toBe('XYSOP');

  });
  it('Should handle get party with invalid id.', async() => {

    const response = await request(app).post(`${InventoryUris.PARTY_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          },
          {
            type: 'delivery',
            addressLine1: '36-C, Orchid Villa',
            addressLine2: 'Harihar Valley',
            addressLine3: 'Monvila',
            addressLine4: 'Trivandrum',
            state: 'Kerala',
            country: 'India',
            pinCode: '689007',
            landMark: 'Near AKG Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          },
          {
            name: 'PAN Number',
            value: 'XYSOP'
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);
    await request(app)['delete'](`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_BAD_REQUEST);
    const response2 = await request(app).get(`${InventoryUris.PARTY_URI}/invalid`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should delete party with valid id.', async() => {

    const response = await request(app).post(`${InventoryUris.PARTY_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          },
          {
            type: 'delivery',
            addressLine1: '36-C, Orchid Villa',
            addressLine2: 'Harihar Valley',
            addressLine3: 'Monvila',
            addressLine4: 'Trivandrum',
            state: 'Kerala',
            country: 'India',
            pinCode: '689007',
            landMark: 'Near AKG Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          },
          {
            name: 'PAN Number',
            value: 'XYSOP'
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app)['delete'](`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Should handle delete party with invalid id.', async() => {

    const response = await request(app).post(`${InventoryUris.PARTY_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        adresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          },
          {
            type: 'delivery',
            addressLine1: '36-C, Orchid Villa',
            addressLine2: 'Harihar Valley',
            addressLine3: 'Monvila',
            addressLine4: 'Trivandrum',
            state: 'Kerala',
            country: 'India',
            pinCode: '689007',
            landMark: 'Near AKG Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          },
          {
            name: 'PAN Number',
            value: 'XYSOP'
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app)['delete'](`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app)['delete'](`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);
    const response4 = await request(app)['delete'](`${InventoryUris.PARTY_URI}/invalid`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_BAD_REQUEST);
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response1.status).toBe(HTTP_BAD_REQUEST);

  });

});
