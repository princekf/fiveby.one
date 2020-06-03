/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import User from '../user/user.model';
import Permission from './permission.model';
import Company from '../company/company.model';
import { Constants, AuthUris, Permission as PermissionEntity, CompanyS as CompanyI } from 'fivebyone';
const { HTTP_OK, HTTP_BAD_REQUEST } = Constants;
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

describe(`${AuthUris.PERMISSION_URI} tests`, () => {

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

    await Permission.remove({});

  });

  it('Should save a new permission with valid values', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_OK);

    const getPermissionBody = await request(app).get(`${AuthUris.PERMISSION_URI}/${validResponse.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const permissionBody: PermissionEntity = getPermissionBody.body;

    expect(getPermissionBody.status).toBe(HTTP_OK);
    expect(permissionBody.name).toBe('CREATE');
    expect(permissionBody.description).toBe('CREATE USER');

  });

  it('Should not save: Name required', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: '',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save with same permission name', async() => {

    const validResponse1 = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse1.status).toBe(HTTP_OK);
    const validResponse2 = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CREATE',
        description: 'Create user with permissions'
      });
    expect(validResponse2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save with minimal values', async() => {

    const minmalResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'UPDATE'
      });
    expect(minmalResponse.status).toBe(HTTP_OK);

    const getMinPermission = await request(app).get(`${AuthUris.PERMISSION_URI}/${minmalResponse.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const permissionBody: PermissionEntity = getMinPermission.body;

    expect(getMinPermission.status).toBe(HTTP_OK);
    expect(permissionBody.name).toBe('UPDATE');

  });

  it('Should save and update a permission', async() => {

    const savePermission = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'SAVE',
        permission: 'Save a user permission'
      });
    expect(savePermission.status).toBe(HTTP_OK);

    const updatePermissionBody = await request(app).put(`${AuthUris.PERMISSION_URI}/${savePermission.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'SAVE USER',
        description: 'SAVE A NEW USER'
      });
    expect(updatePermissionBody.status).toBe(HTTP_OK);
    const updatedPermisson: PermissionEntity = updatePermissionBody.body;

    expect(updatedPermisson.name).toBe('SAVE USER');
    expect(updatedPermisson.description).toBe('SAVE A NEW USER');

    const getUpdatePermission = await request(app).get(`${AuthUris.PERMISSION_URI}/${savePermission.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const permissionBody: PermissionEntity = getUpdatePermission.body;
    expect(getUpdatePermission.status).toBe(HTTP_OK);
    expect(permissionBody.name).toBe('SAVE USER');
    expect(permissionBody.description).toBe('SAVE A NEW USER');

  });

  it('Send a BAD REQUEST for a update request with empty body', async() => {

    const savePermission = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'SAVE',
        permission: 'Save a user permission'
      });
    expect(savePermission.status).toBe(HTTP_OK);

    const updatePermissionBody = await request(app).put(`${AuthUris.PERMISSION_URI}/${savePermission.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({});
    expect(updatePermissionBody.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Send a BAD REQUEST for a update request without body', async() => {

    const savePermission = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'SAVE',
        permission: 'Save a user permission'
      });
    expect(savePermission.status).toBe(HTTP_OK);

    const updatePermissionBody = await request(app).put(`${AuthUris.PERMISSION_URI}/${savePermission.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(updatePermissionBody.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Send a BAD REQUEST for a update by an invalid/dumb id', async() => {

    const savePermission = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'SAVE',
        permission: 'Save a user permission'
      });
    expect(savePermission.status).toBe(HTTP_OK);

    const updatePermissionBody = await request(app).put(`${AuthUris.PERMISSION_URI}/abc`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'SAVE USER',
        description: 'SAVE A NEW USER'
      });
    expect(updatePermissionBody.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should create and then retrieve a new permission by a valid Id', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_OK);

    const getPermissionBody = await request(app).get(`${AuthUris.PERMISSION_URI}/${validResponse.body._id}`)

      .set('Authorization', `Bearer ${serverToken}`);
    const permissionBody: PermissionEntity = getPermissionBody.body;

    expect(getPermissionBody.status).toBe(HTTP_OK);
    expect(permissionBody.name).toBe('CREATE');
    expect(permissionBody.description).toBe('CREATE USER');

  });


  it('Should repond with a BAD REQUEST when fetching with an dumb id/deleted Id', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_OK);

    const invalidResponse = await request(app).get(`${AuthUris.PERMISSION_URI}/abc`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(invalidResponse.status).toBe(HTTP_BAD_REQUEST);

    const getPermissionBody = await request(app).get(`${AuthUris.PERMISSION_URI}/5ed2159ff4aaea50399edbf2`)
      .set('Authorization', `Bearer ${serverToken}`);

    expect(getPermissionBody.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save and then delete a permission', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_OK);

    const getPermissionBody = await request(app)['delete'](`${AuthUris.PERMISSION_URI}/${validResponse.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(getPermissionBody.status).toBe(HTTP_OK);

    const deletedPermissionBody = await request(app).get(`${AuthUris.PERMISSION_URI}/${validResponse.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(deletedPermissionBody.status).toBe(HTTP_BAD_REQUEST);

  });


  it('Deleting a permission with dumb/deleted id should respond with a BAD REQUEST', async() => {

    const getPermissionBody = await request(app)['delete'](`${AuthUris.PERMISSION_URI}/abc`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(getPermissionBody.status).toBe(HTTP_BAD_REQUEST);

    const deletedPermission = await request(app)['delete'](`${AuthUris.PERMISSION_URI}/5ed2176da7b1ca52f39337c4`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(deletedPermission.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save two new permissions and should list all', async() => {

    const validResponse1 = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse1.status).toBe(HTTP_OK);
    const permission1: PermissionEntity = validResponse1.body;
    expect(validResponse1.status).toBe(HTTP_OK);
    expect(permission1.name).toBe('CREATE');
    expect(permission1.description).toBe('CREATE USER');

    const validResponse2 = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'UPDATE',
        description: 'UPDATE USER'
      });
    expect(validResponse2.status).toBe(HTTP_OK);
    const permission2: PermissionEntity = validResponse2.body;
    expect(permission2.name).toBe('UPDATE');
    expect(permission2.description).toBe('UPDATE USER');

    const listAllResponse = await request(app).get(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(listAllResponse.status).toBe(HTTP_OK);
    const permissions: Array<PermissionEntity> = listAllResponse.body;
    expect(permissions).toMatchObject([
      {
        name: 'CREATE',
        description: 'CREATE USER'
      },
      {
        name: 'UPDATE',
        description: 'UPDATE USER'
      },
    ]);

  });

});
