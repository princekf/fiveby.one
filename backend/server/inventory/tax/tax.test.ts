/* eslint max-lines-per-function: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import User from '../../users/user.model';
import Tax from './tax.model';
import {Constants, Tax as TaxEntity} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

describe('/api/inventory/tax tests', () => {

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
  const tPercentage = 18;
  // Create a sample item
  beforeEach(async() => {

    const tax = new Tax();
    tax.groupName = 'Tax Group Name';
    tax.name = 'Tax Name';
    tax.effectiveFrom = [ {
      startDate: new Date('2018-01-01'),
      endDate: new Date('2020-12-31'),
      percentage: tPercentage
    } ];
    await tax.save();

  });


  // Remove sample items
  afterEach(async() => {

    await Tax.remove({});

  });
  it('should get taxes', async() => {

    const response = await request(app).get('/api/inventory/tax')
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_OK);
    const listedTaxes: TaxEntity[] = response.body;
    expect(listedTaxes.length).toEqual(1);
    expect(listedTaxes).toEqual([
      expect.objectContaining({
        name: 'Tax Name',
        groupName: 'Tax Group Name'
      }),
    ]);
    const effectiveFromObj = listedTaxes[0].effectiveFrom;
    expect(effectiveFromObj.length).toEqual(1);
    const firstIdx = 0;
    const {startDate, endDate, percentage} = effectiveFromObj[firstIdx];
    expect(startDate).toBe(new Date('2018-01-01').toISOString());
    expect(endDate).toBe(new Date('2020-12-31').toISOString());
    expect(percentage).toBe(tPercentage);

  });

  it('should post tax', async() => {

    const response = await request(app).post('/api/inventory/tax')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'new Tax',
        groupName: 'group Tax',
        effectiveFrom: [ {
          startDate: new Date('2018-01-01'),
          endDate: new Date('2020-12-31'),
          percentage: 28
        } ]
      });
    expect(response.status).toBe(HTTP_OK);
    expect(response.body).toBe('Tax saved!');

  });


  it('should catch errors when posting tax', async() => {

    const response = await request(app).post('/api/inventory/tax')
      .set('Authorization', `Bearer ${serverToken}`)
      .send({});
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

});
