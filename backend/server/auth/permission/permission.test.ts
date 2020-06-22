/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import { UserModel } from '../../auth/user/user.model';
import { AdminUserModel } from '../../auth/admin/admin.model';
import {
  Constants, AuthUris,
  Company,
  Permission as PermissionEntity
} from 'fivebyone';
import { PermissionModel } from './permission.model';

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;


describe(`${AuthUris.PERMISSION_URI} tests`, () => {

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
    AdminSchema.deleteMany({});
    await mongoose.disconnect();
    await mongod.stop();

  });

  beforeEach(async() => {

    await createRootLevelClient();

  });

  afterEach(async() => {

    const User = UserModel.createModel(company.code);
    await User.deleteMany({});
    const PermissionMod = PermissionModel.createModel(company.code);
    await PermissionMod.deleteMany({});

  });

  it('Should save a new permission with valid values', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_OK);

    const getPermissionBody = await request(app).get(`${AuthUris.PERMISSION_URI}/${validResponse.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const permissionBody: PermissionEntity = getPermissionBody.body;

    expect(getPermissionBody.status).toBe(HTTP_OK);
    expect(permissionBody.name).toBe('CREATE');
    expect(permissionBody.description).toBe('CREATE USER');

  });

  it('Should not save a new permission with an invalid token', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer2 ${clientToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not save a new permission with an empty token', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not save: Name required', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: '',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save with same permission name', async() => {

    const validResponse1 = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse1.status).toBe(HTTP_OK);
    const validResponse2 = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'CREATE',
        description: 'Create user with permissions'
      });
    expect(validResponse2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save with minimal values', async() => {

    const minmalResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'UPDATE'
      });
    expect(minmalResponse.status).toBe(HTTP_OK);

    const getMinPermission = await request(app).get(`${AuthUris.PERMISSION_URI}/${minmalResponse.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const permissionBody: PermissionEntity = getMinPermission.body;

    expect(getMinPermission.status).toBe(HTTP_OK);
    expect(permissionBody.name).toBe('UPDATE');

  });

  it('Should save and update a permission', async() => {

    const savePermission = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'SAVE',
        permission: 'Save a user permission'
      });
    expect(savePermission.status).toBe(HTTP_OK);

    const updatePermissionBody = await request(app).put(`${AuthUris.PERMISSION_URI}/${savePermission.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'SAVE USER',
        description: 'SAVE A NEW USER'
      });
    expect(updatePermissionBody.status).toBe(HTTP_OK);
    const updatedPermisson: PermissionEntity = updatePermissionBody.body;

    expect(updatedPermisson.name).toBe('SAVE USER');
    expect(updatedPermisson.description).toBe('SAVE A NEW USER');

    const getUpdatePermission = await request(app).get(`${AuthUris.PERMISSION_URI}/${savePermission.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const permissionBody: PermissionEntity = getUpdatePermission.body;
    expect(getUpdatePermission.status).toBe(HTTP_OK);
    expect(permissionBody.name).toBe('SAVE USER');
    expect(permissionBody.description).toBe('SAVE A NEW USER');

  });

  it('Should not update a permission with an invalid token', async() => {

    const savePermission = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'SAVE',
        permission: 'Save a user permission'
      });
    expect(savePermission.status).toBe(HTTP_OK);

    const updatePermissionBody = await request(app).put(`${AuthUris.PERMISSION_URI}/${savePermission.body._id}`)
      .set('Authorization', `Bearer2 ${clientToken}`)
      .send({
        name: 'SAVE USER',
        description: 'SAVE A NEW USER'
      });
    expect(updatePermissionBody.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not update a permission with an empty token', async() => {

    const savePermission = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'SAVE',
        permission: 'Save a user permission'
      });
    expect(savePermission.status).toBe(HTTP_OK);

    const updatePermissionBody = await request(app).put(`${AuthUris.PERMISSION_URI}/${savePermission.body._id}`)
      .send({
        name: 'SAVE USER',
        description: 'SAVE A NEW USER'
      });
    expect(updatePermissionBody.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Send a BAD REQUEST for a update request with empty body', async() => {

    const savePermission = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'SAVE',
        permission: 'Save a user permission'
      });
    expect(savePermission.status).toBe(HTTP_OK);

    const updatePermissionBody = await request(app).put(`${AuthUris.PERMISSION_URI}/${savePermission.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({});
    expect(updatePermissionBody.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Send a BAD REQUEST for a update request without body', async() => {

    const savePermission = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'SAVE',
        permission: 'Save a user permission'
      });
    expect(savePermission.status).toBe(HTTP_OK);

    const updatePermissionBody = await request(app).put(`${AuthUris.PERMISSION_URI}/${savePermission.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(updatePermissionBody.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Send a BAD REQUEST for a update by an invalid/dumb id', async() => {

    const savePermission = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'SAVE',
        permission: 'Save a user permission'
      });
    expect(savePermission.status).toBe(HTTP_OK);

    const updatePermissionBody = await request(app).put(`${AuthUris.PERMISSION_URI}/abc`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'SAVE USER',
        description: 'SAVE A NEW USER'
      });
    expect(updatePermissionBody.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should create and then retrieve a new permission by a valid Id', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_OK);

    const getPermissionBody = await request(app).get(`${AuthUris.PERMISSION_URI}/${validResponse.body._id}`)

      .set('Authorization', `Bearer ${clientToken}`);
    const permissionBody: PermissionEntity = getPermissionBody.body;

    expect(getPermissionBody.status).toBe(HTTP_OK);
    expect(permissionBody.name).toBe('CREATE');
    expect(permissionBody.description).toBe('CREATE USER');

  });


  it('Should repond with a BAD REQUEST when fetching with an dumb id/deleted Id', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_OK);

    const invalidResponse = await request(app).get(`${AuthUris.PERMISSION_URI}/abc`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(invalidResponse.status).toBe(HTTP_BAD_REQUEST);

    const getPermissionBody = await request(app).get(`${AuthUris.PERMISSION_URI}/5ed2159ff4aaea50399edbf2`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(getPermissionBody.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save and then delete a permission', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_OK);

    const getPermissionBody = await request(app)['delete'](`${AuthUris.PERMISSION_URI}/${validResponse.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(getPermissionBody.status).toBe(HTTP_OK);

    const deletedPermissionBody = await request(app).get(`${AuthUris.PERMISSION_URI}/${validResponse.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(deletedPermissionBody.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not delete a permission with an invalid token', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_OK);

    const getPermissionBody = await request(app)['delete'](`${AuthUris.PERMISSION_URI}/${validResponse.body._id}`)
      .set('Authorization', `Bearer2 ${clientToken}`);
    expect(getPermissionBody.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not delete a permission with an empty token', async() => {

    const validResponse = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'CREATE',
        description: 'CREATE USER'
      });
    expect(validResponse.status).toBe(HTTP_OK);

    const getPermissionBody = await request(app)['delete'](`${AuthUris.PERMISSION_URI}/${validResponse.body._id}`);
    expect(getPermissionBody.status).toBe(HTTP_UNAUTHORIZED);

  });


  it('Deleting a permission with dumb/deleted id should respond with a BAD REQUEST', async() => {

    const getPermissionBody = await request(app)['delete'](`${AuthUris.PERMISSION_URI}/abc`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(getPermissionBody.status).toBe(HTTP_BAD_REQUEST);

    const deletedPermission = await request(app)['delete'](`${AuthUris.PERMISSION_URI}/5ed2176da7b1ca52f39337c4`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(deletedPermission.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save two new permissions and should list all', async() => {

    const validResponse1 = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'UPDATE',
        description: 'UPDATE USER'
      });
    expect(validResponse2.status).toBe(HTTP_OK);
    const permission2: PermissionEntity = validResponse2.body;
    expect(permission2.name).toBe('UPDATE');
    expect(permission2.description).toBe('UPDATE USER');

    const listAllResponse = await request(app).get(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`);
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

  it('Should not list all permissions using invalid token', async() => {

    const validResponse1 = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'UPDATE',
        description: 'UPDATE USER'
      });
    expect(validResponse2.status).toBe(HTTP_OK);
    const permission2: PermissionEntity = validResponse2.body;
    expect(permission2.name).toBe('UPDATE');
    expect(permission2.description).toBe('UPDATE USER');

    const listAllResponse = await request(app).get(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer2 ${clientToken}`);
    expect(listAllResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not list all permissions using empty token', async() => {

    const validResponse1 = await request(app).post(`${AuthUris.PERMISSION_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
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
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'UPDATE',
        description: 'UPDATE USER'
      });
    expect(validResponse2.status).toBe(HTTP_OK);
    const permission2: PermissionEntity = validResponse2.body;
    expect(permission2.name).toBe('UPDATE');
    expect(permission2.description).toBe('UPDATE USER');

    const listAllResponse = await request(app).get(`${AuthUris.PERMISSION_URI}`);
    expect(listAllResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

});
