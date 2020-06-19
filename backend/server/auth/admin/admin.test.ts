/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import { AuthUris, Constants, User } from 'fivebyone';
import { AdminUserModel } from './admin.model';

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_INTERNAL_SERVER_ERROR, HTTP_UNAUTHORIZED } = Constants;

describe(`${AuthUris.ADMIN_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';


  beforeAll(async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });

  });

  // Remove sample items
  afterEach(async() => {

    const AdminUser = AdminUserModel.createModel();
    await AdminUser.remove({});

  });

  // Remove test user, disconnect and stop database
  afterAll(async() => {

    const AdminUser = AdminUserModel.createModel();
    await AdminUser.remove({});
    await mongoose.disconnect();
    await mongod.stop();

  });

  it('Install API : Should install one admin user and login with the user', async() => {


    const response = await request(app).post(`${AuthUris.ADMIN_URI}`)
      .send({
        email: 'pshaji@fivebyone.com',
        password: 'Simple_12@',
        name: 'Pashanam Shaji',
        mobile: '+919234567887'
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post(`${AuthUris.ADMIN_URI}/login`)
      .send({
        email: 'pshaji@fivebyone.com',
        password: 'Simple_12@',
      });
    expect(response2.status).toBe(HTTP_OK);
    expect(response2.body).toHaveProperty('token');
    expect(response2.body).toHaveProperty('expiry');

  });


  it('Install API : Should install only one admin user', async() => {

    const response = await request(app).post(`${AuthUris.ADMIN_URI}`)
      .send({
        email: 'pshaji@fivebyone.com',
        password: 'Simple_12@',
        name: 'Pashanam Shaji',
        mobile: '+919234567887'
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post(`${AuthUris.ADMIN_URI}`)
      .send({
        email: 'ddhamu@fivebyone.com',
        password: 'Simple_12@',
        name: 'Dhashamoolam Dhamu',
        mobile: '+919287567887'
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);
    const response3 = await request(app).post(`${AuthUris.ADMIN_URI}/login`)
      .send({
        email: 'ddhamu@fivebyone.com',
        password: 'Simple_12@',
      });
    expect(response3.status).toBe(HTTP_INTERNAL_SERVER_ERROR);

  });


  it('Get All API : Installing admin user and getting all the created user', async() => {

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
    serverToken = response2.body.token;
    const response3 = await request(app).get(`${AuthUris.ADMIN_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    expect(response3.body[0].name).toBe(user.name);
    expect(response3.body[0].email).toBe(user.email);
    expect(response3.body[0].mobile).toBe(user.mobile);

  });


  it('Get All API : Getting all the created user without token', async() => {

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
    const response3 = await request(app).get(`${AuthUris.ADMIN_URI}`);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });


  it('Get All API : Getting all the created user with invalid token', async() => {

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
    serverToken = response2.body.token;
    const response3 = await request(app).get(`${AuthUris.ADMIN_URI}`)
      .set('Authorization', `Bearer2 ${serverToken}`);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });


  it('Get API : Installing admin user and getting the user', async() => {

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
    serverToken = response2.body.token;
    const response3 = await request(app).get(`${AuthUris.ADMIN_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    expect(response3.body.name).toBe(user.name);
    expect(response3.body.email).toBe(user.email);
    expect(response3.body.mobile).toBe(user.mobile);

  });


  it('Get API : Installing admin user and getting the user with dumb id', async() => {

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
    serverToken = response2.body.token;
    const response3 = await request(app).get(`${AuthUris.ADMIN_URI}/5ed2497242e04916ef53c87a`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });


  it('Get API : Getting user without server token', async() => {

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
    const response3 = await request(app).get(`${AuthUris.ADMIN_URI}/${response.body._id}`);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });


  it('Get API : Getting user with invaild server token', async() => {

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
    serverToken = response2.body.token;
    const response3 = await request(app).get(`${AuthUris.ADMIN_URI}/${response.body._id}`)
      .set('Authorization', `Bearer2 ${serverToken}`);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });


  it('Delete API : Creating admin user and deleting the created user', async() => {

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
    serverToken = response2.body.token;
    const response3 = await request(app)['delete'](`${AuthUris.ADMIN_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);

  });


  it('Delete API : Creating admin user and deleting the deleted user', async() => {

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
    serverToken = response2.body.token;
    const response3 = await request(app)['delete'](`${AuthUris.ADMIN_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const response4 = await request(app)['delete'](`${AuthUris.ADMIN_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Delete API : Creating admin user and deleting created user without token', async() => {

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
    const response3 = await request(app)['delete'](`${AuthUris.ADMIN_URI}/${response.body._id}`);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });


  it('Delete API : Creating admin user and deleting the created user', async() => {

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
    serverToken = response2.body.token;
    const response3 = await request(app)['delete'](`${AuthUris.ADMIN_URI}/${response.body._id}`)
      .set('Authorization', `Bearer2 ${serverToken}`);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Delete API : Creating admin user and deleting the created user with dumb id', async() => {

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
    serverToken = response2.body.token;
    const response3 = await request(app)['delete'](`${AuthUris.ADMIN_URI}/5ed2497242e04916ef53c87a`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });


  it('Update API : Should update admin user', async() => {

    const response = await request(app).post(`${AuthUris.ADMIN_URI}`)
      .send({
        email: 'pshaji@fivebyone.com',
        password: 'Simple_12@',
        name: 'Pashanam Shaji',
        mobile: '+919234567887'
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post(`${AuthUris.ADMIN_URI}/login`)
      .send({
        email: 'pshaji@fivebyone.com',
        password: 'Simple_12@',
      });
    expect(response2.status).toBe(HTTP_OK);
    serverToken = response2.body.token;
    const updateUser = {
      email: 'pshaji@fivebyone.com',
      password: 'Simple_12@',
      name: 'Pashanam Shajith',
      mobile: '+919234567999'
    };
    const response3 = await request(app).put(`${AuthUris.ADMIN_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updateUser);
    expect(response3.status).toBe(HTTP_OK);
    expect(response3.body.name).toBe(updateUser.name);
    expect(response3.body.mobile).toBe(updateUser.mobile);

  });


  it('Update API : Should not update admin user with invaild token', async() => {

    const response = await request(app).post(`${AuthUris.ADMIN_URI}`)
      .send({
        email: 'pshaji@fivebyone.com',
        password: 'Simple_12@',
        name: 'Pashanam Shaji',
        mobile: '+919234567887'
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post(`${AuthUris.ADMIN_URI}/login`)
      .send({
        email: 'pshaji@fivebyone.com',
        password: 'Simple_12@',
      });
    expect(response2.status).toBe(HTTP_OK);
    serverToken = response2.body.token;
    const updateUser = {
      email: 'pshaji@fivebyone.com',
      password: 'Simple_12@',
      name: 'Pashanam Shajith',
      mobile: '+919234567999'
    };
    const response3 = await request(app).put(`${AuthUris.ADMIN_URI}/${response.body._id}`)
      .set('Authorization', `Bearer2 ${serverToken}`)
      .send(updateUser);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });


  it('Update API : Should not update admin user without token', async() => {

    const response = await request(app).post(`${AuthUris.ADMIN_URI}`)
      .send({
        email: 'pshaji@fivebyone.com',
        password: 'Simple_12@',
        name: 'Pashanam Shaji',
        mobile: '+919234567887'
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post(`${AuthUris.ADMIN_URI}/login`)
      .send({
        email: 'pshaji@fivebyone.com',
        password: 'Simple_12@',
      });
    expect(response2.status).toBe(HTTP_OK);
    const updateUser = {
      email: 'pshaji@fivebyone.com',
      password: 'Simple_12@',
      name: 'Pashanam Shajith',
      mobile: '+919234567999'
    };
    const response3 = await request(app).put(`${AuthUris.ADMIN_URI}/${response.body._id}`)
      .send(updateUser);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });


  it('Update API : Should not update admin user with invalid id', async() => {

    const response = await request(app).post(`${AuthUris.ADMIN_URI}`)
      .send({
        email: 'pshaji@fivebyone.com',
        password: 'Simple_12@',
        name: 'Pashanam Shaji',
        mobile: '+919234567887'
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post(`${AuthUris.ADMIN_URI}/login`)
      .send({
        email: 'pshaji@fivebyone.com',
        password: 'Simple_12@',
      });
    expect(response2.status).toBe(HTTP_OK);
    serverToken = response2.body.token;
    const updateUser = {
      email: 'pshaji@fivebyone.com',
      password: 'Simple_12@',
      name: 'Pashanam Shajith',
      mobile: '+919234567999'
    };
    const response3 = await request(app).put(`${AuthUris.ADMIN_URI}/5ed24942e04916ef53c87a`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(updateUser);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });


});
