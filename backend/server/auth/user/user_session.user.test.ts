/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import { UserModel } from './user.model';
import { AdminUserModel } from '../admin/admin.model';
import {
  Constants, AuthUris,
  User as UserEntity,
  Company
} from 'fivebyone';

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;


describe(`${AuthUris.USER_URI} tests`, () => {

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
    AdminSchema.remove({});
    await mongoose.disconnect();
    await mongod.stop();

  });

  beforeEach(async() => {

    await createRootLevelClient();

  });

  afterEach(async() => {

    const User = UserModel.createModel(company.code);
    await User.remove({});

  });

  it('SHOULD NOT: login with an invalid user', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}/${company.code}/login`)
      .send({
        email: 'stranger@email.com',
        password: 'Simple_12@'
      });
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: login a user with invalid company code, but with valid credentials', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}/ABC/login`)
      .send({
        email: 'automobiles@KnK.com',
        password: 'Simple_12@'
      });
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD: save user with valid values.', async() => {

    const userJson = {
      name: 'Pawanayi',
      mobile: '+91123456789',
      email: 'pawanayi@fivebyOne.com',
      password: 'Simple_123@',
      addressLine1: 'Jawahar Nagar',
      addressLine2: 'TTC',
      addressLine3: 'Vellayambalam',
      addressLine4: 'Museum',
      state: 'Kerala',
      country: 'India',
      pinCode: '223344'
    };

    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(userJson);
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(validResponse.status).toBe(HTTP_OK);
    const user: UserEntity = validResponse.body;
    expect(user.name).toBe(userJson.name);
    expect(user.mobile).toBe(userJson.mobile);
    expect(user.email).toBe(userJson.email);
    expect(user.addressLine1).toBe(userJson.addressLine1);
    expect(user.addressLine2).toBe(userJson.addressLine2);
    expect(user.addressLine3).toBe(userJson.addressLine3);
    expect(user.addressLine4).toBe(userJson.addressLine4);
    expect(user.state).toBe(userJson.state);
    expect(user.country).toBe(userJson.country);
    expect(user.pinCode).toBe(user.pinCode);

  });

  it('SHOULD NOT: save user with an invalid token.', async() => {

    const userJson = {
      name: 'Pawanayi',
      mobile: '+91123456789',
      email: 'pawanayi@fivebyOne.com',
      password: 'Simple_123@',
      addressLine1: 'Jawahar Nagar',
      addressLine2: 'TTC',
      addressLine3: 'Vellayambalam',
      addressLine4: 'Museum',
      state: 'Kerala',
      country: 'India',
      pinCode: '223344'
    };

    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer2 ${clientToken}`)
      .send(userJson);
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: save user without a token.', async() => {

    const userJson = {
      name: 'Pawanayi',
      mobile: '+91123456789',
      email: 'pawanayi@fivebyOne.com',
      password: 'Simple_123@',
      addressLine1: 'Jawahar Nagar',
      addressLine2: 'TTC',
      addressLine3: 'Vellayambalam',
      addressLine4: 'Museum',
      state: 'Kerala',
      country: 'India',
      pinCode: '223344'
    };

    const response = await request(app).post(AuthUris.USER_URI)
      .send(userJson);
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: save user with invalid Email Id', async() => {

    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'John Honai',
        mobile: '+91123456789',
        email: 'xxyyx@yahoo',
        password: 'Simple_123@',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: save a user with valid Email Id', async() => {

    const input = {
      name: 'John Honai',
      mobile: '+91123456789',
      email: 'john.honai@xpeditons.in',
      password: 'Simple_123@',
      addressLine1: 'Jawahar Nagar',
      addressLine2: 'TTC',
      addressLine3: 'Vellayambalam',
      addressLine4: 'Museum',
      state: 'Kerala',
      country: 'India',
      pinCode: '223344'
    };
    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(input);
    expect(response.status).toBe(HTTP_OK);
    const validResponse = await request(app).get(`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(validResponse.status).toBe(HTTP_OK);
    const user: UserEntity = validResponse.body;
    expect(user.name).toBe(input.name);
    expect(user.mobile).toBe(input.mobile);
    expect(user.addressLine1).toBe(input.addressLine1);
    expect(user.addressLine2).toBe(input.addressLine2);
    expect(user.addressLine3).toBe(input.addressLine3);
    expect(user.addressLine4).toBe(input.addressLine4);
    expect(user.state).toBe(input.state);
    expect(user.country).toBe(input.country);
    expect(user.pinCode).toBe(input.pinCode);

  });

  it('SHOULD NOT: save user with invalid Mobile number', async() => {


    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'John Honai',
        mobile: '+912345',
        email: 'john.honai@xpeditions.in',
        password: 'Simple_123@',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: save user with valid Mobile number', async() => {

    const input = {
      name: 'John Honai',
      mobile: '+917907919930',
      email: 'john.honai@xpeditions.in',
      password: 'Simple_123@',
      addressLine1: 'Jawahar Nagar',
      addressLine2: 'TTC',
      addressLine3: 'Vellayambalam',
      addressLine4: 'Museum',
      state: 'Kerala',
      country: 'India',
      pinCode: '223344'
    };
    const response1 = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(input);
    expect(response1.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.USER_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(getResponse.status).toBe(HTTP_OK);
    const userData: UserEntity = getResponse.body;
    expect(userData.mobile).toBe(input.mobile);

  });

  it('SHOULD: save user with minimum valid values.', async() => {

    const input = {
      name: 'Cid saamu',
      email: 'cidMoosa@fivebyOne.com',
      password: 'Simple_123@'
    };
    const minValidResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(input);
    expect(minValidResponse.status).toBe(HTTP_OK);
    const savedMinValidResponse = await request(app).get(`${AuthUris.USER_URI}/${minValidResponse.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(savedMinValidResponse.status).toBe(HTTP_OK);
    const user: UserEntity = savedMinValidResponse.body;
    expect(user.name).toBe(input.name);
    expect(user.email).toBe(input.email);

  });

  it('SHOULD NOT: save - email is required.', async() => {


    const invalidEmailResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'John Honai',
        email: '  ',
        password: 'Simple_123@',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(invalidEmailResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: save - email should be unique.', async() => {


    const validEmailResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Pachalam Bhasi',
        email: 'john.honai@fivebyOne.com',
        password: 'Simple_123@',
        mobile: '+91123456789',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(validEmailResponse.status).toBe(HTTP_OK);
    const sameEmailResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Appukkuttan',
        email: 'john.honai@fivebyOne.com',
        password: 'Simple_123@',
        mobile: '+911223567890',
        addressLine1: 'Gandhi Nagar',
        addressLine2: 'Vytilla',
        addressLine3: '',
        addressLine4: 'Ernakulam',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(sameEmailResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: save - name is required.', async() => {

    const emptyNameResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: '  ',
        email: 'pachalam.bhasi@fivebyOne.com',
        password: 'Simple_123@',
        mobile: '+91123456789',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(emptyNameResponse.status).toBe(HTTP_BAD_REQUEST);
    const noNameResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        email: 'pachalam.bhasi@fivebyOne.com',
        password: 'Simple_123@',
        mobile: '+91123456789',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(noNameResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: save with empty password', async() => {

    const emptyPasswordResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Sagar Alias Jacky',
        email: 'sagar.alias.jacky@fivebyOne.com',
        mobile: '+91123456789',
        password: '',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(emptyPasswordResponse.status).toBe(HTTP_BAD_REQUEST);
    const noPasswordResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Sagar Alias Jacky',
        email: 'sagar.alias.jacky@fivebyOne.com',
        mobile: '+91123456789',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(noPasswordResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: save - if password doesn\'t match the confirmed standards', async() => {

    /*
     *  Aa_1
     * aabb_c1
     * AAABB_C1
     * abcdA_CC
     * abcdA1CC
     */

    const wrongPasswordResponse1 = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Sagar Alias Jacky',
        email: 'sagar.alias.jacky@fivebyOne.com',
        mobile: '+91123456789',
        password: '',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'

      });
    expect(wrongPasswordResponse1.status).toBe(HTTP_BAD_REQUEST);

    const wrongPasswordResponse2 = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Sagar Alias Jacky',
        password: 'Aa_1',
        email: 'sagar.alias.jacky@fivebyOne.com',
        mobile: '+91123456789',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'

      });
    expect(wrongPasswordResponse2.status).toBe(HTTP_BAD_REQUEST);
    const wrongPasswordResponse3 = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Sagar Alias Jacky',
        password: 'aabb_c1',
        email: 'sagar.alias.jacky@fivebyOne.com',
        mobile: '+91123456789',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'

      });
    expect(wrongPasswordResponse3.status).toBe(HTTP_BAD_REQUEST);

    const wrongPasswordResponse4 = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Sagar Alias Jacky',
        password: 'AAABB_C1',
        email: 'sagar.alias.jacky@fivebyOne.com',
        mobile: '+91123456789',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(wrongPasswordResponse4.status).toBe(HTTP_BAD_REQUEST);

    const wrongPasswordResponse5 = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Sagar Alias Jacky',
        password: 'abcdA_CC',
        email: 'sagar.alias.jacky@fivebyOne.com',
        mobile: '+91123456789',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'

      });
    expect(wrongPasswordResponse5.status).toBe(HTTP_BAD_REQUEST);

    const wrongPasswordResponse6 = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Sagar Alias Jacky',
        password: 'abcdA_C1',
        email: 'sagar.alias.jacky@fivebyOne.com',
        mobile: '+91123456789',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'

      });
    expect(wrongPasswordResponse6.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: Save a user record and get it by its id', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
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
        pinCode: '223344'
      });
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

  });

  it('SHOULD: Send BAD REQUEST for a fetch by an invalid user Id', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
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
        pinCode: '223344'
      });
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.USER_URI}/abc`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: Send BAD REQUEST when fetching a user record already deleted', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
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
        pinCode: '223344'
      });
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app)['delete'](`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(validResponse.status).toBe(HTTP_OK);
    const getDeleteUser = await request(app).get(`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(getDeleteUser.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: list all Users', async() => {

    const listAllUserReponse = await request(app).get(`${AuthUris.USER_URI}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(listAllUserReponse.status).toBe(HTTP_OK);

  });

  it('SHOULD: update a user by their id', async() => {

    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({

        name: 'James Bond',
        mobile: '+91123046007',
        email: 'newuser@fivebyOne.com',
        password: 'Simple_123@',
        addressLine1: 'Vazhuthakad',
        addressLine2: 'Opp. Krishi Bhavan',
        addressLine3: 'Vellayambalam',
        addressLine4: 'TVM',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(savedUser.status).toBe(HTTP_OK);
    expect(savedUser.body).toHaveProperty('_id');
    const updatedUserBody = await request(app).put(`${AuthUris.USER_URI}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({

        name: 'Palarivattam Sasi',
        mobile: '+917907919932',
        email: 'newuser@fivebyOne.com',
        password: 'Simple_123@',
        addressLine1: 'Castle Royale',
        addressLine2: 'Opp. Watch House',
        addressLine3: 'Palayam',
        addressLine4: 'TVM',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(updatedUserBody.status).toBe(HTTP_OK);
    const updatedUserResponse = await request(app).get(`${AuthUris.USER_URI}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(updatedUserResponse.status).toBe(HTTP_OK);
    expect(updatedUserResponse.body.name).toBe('Palarivattam Sasi');
    expect(updatedUserResponse.body.mobile).toBe('+917907919932');
    expect(updatedUserResponse.body.email).toBe('newuser@fivebyOne.com');
    expect(updatedUserResponse.body.addressLine1).toBe('Castle Royale');
    expect(updatedUserResponse.body.addressLine2).toBe('Opp. Watch House');
    expect(updatedUserResponse.body.addressLine3).toBe('Palayam');
    expect(updatedUserResponse.body.addressLine4).toBe('TVM');
    expect(updatedUserResponse.body.state).toBe('Kerala');
    expect(updatedUserResponse.body.country).toBe('India');
    expect(updatedUserResponse.body.pinCode).toBe('223344');

  });


  it('SHOULD: update a user with only required fields', async() => {

    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Joseph Alex',
        mobile: '+919656444108',
        email: 'joseph.alex211@fivebyOne.com',
        password: 'Simple_123@',
        addressLine1: 'Manorama Jn.',
        addressLine2: 'Vytila',
        addressLine3: 'Ernakulam',
        addressLine4: 'Ernakulam South',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(savedUser.status).toBe(HTTP_OK);
    expect(savedUser.body).toHaveProperty('_id');
    const updatedUserResponse = await request(app).put(`${AuthUris.USER_URI}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Palarivattam Sasi',
        mobile: '+919656444108',
        email: 'joseph.alex211@fivebyOne.com',
        password: 'Simple_123@',
        addressLine1: 'Manorama Jn.',
        addressLine2: 'Vytila',
        addressLine3: 'Ernakulam',
        addressLine4: 'Ernakulam South',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(updatedUserResponse.status).toBe(HTTP_OK);
    expect(updatedUserResponse.body.name).toBe('Palarivattam Sasi');

  });

  it('SHOULD: update a user with valid mobile number', async() => {

    const userJson = {
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
      pinCode: '223344'
    };

    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(userJson);
    expect(savedUser.status).toBe(HTTP_OK);
    expect(savedUser.body).toHaveProperty('_id');
    const updatedUserResponse = await request(app).put(`${AuthUris.USER_URI}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Joseph Alex',
        mobile: '+919447311694',
        email: 'joseph.alex@fivebyOne.com',
        password: 'Simple_123@',
        addressLine1: 'Manorama Jn.',
        addressLine2: 'Vytila',
        addressLine3: 'Ernakulam',
        addressLine4: 'Ernakulam South',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(updatedUserResponse.status).toBe(HTTP_OK);
    const userEntity: UserEntity = updatedUserResponse.body;
    expect(userEntity.mobile).toBe('+919447311694');

  });

  it('SHOULD NOT: update a user with invalid mobile number', async() => {

    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Joseph Alex',
        mobile: '+91123046007',
        email: 'joseph.alex@fivebyOne.com',
        password: 'Simple_123@',
        addressLine1: 'Manorama Jn.',
        addressLine2: 'Vytila',
        addressLine3: 'Ernakulam',
        addressLine4: 'Ernakulam South',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(savedUser.status).toBe(HTTP_OK);
    expect(savedUser.body).toHaveProperty('_id');
    const updatedUserResponse = await request(app).put(`${AuthUris.USER_URI}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Joseph Alex',
        mobile: '+919447',
        email: 'joseph.alex@fivebyOne.com',
        password: 'Simple_123@',
        addressLine1: 'Manorama Jn.',
        addressLine2: 'Vytila',
        addressLine3: 'Ernakulam',
        addressLine4: 'Ernakulam South',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(updatedUserResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: update a user with empty name', async() => {

    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Joseph Alex',
        mobile: '+91123046007',
        email: 'joseph.alex@fivebyOne.com',
        password: 'Simple_123@',
        addressLine1: 'Manorama Jn.',
        addressLine2: 'Vytila',
        addressLine3: 'Ernakulam',
        addressLine4: 'Ernakulam South',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(savedUser.status).toBe(HTTP_OK);
    expect(savedUser.body).toHaveProperty('_id');
    const updatedUserResponse = await request(app).put(`${AuthUris.USER_URI}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: '     ',
        mobile: '+91123046007',
        email: 'joseph.alex@fivebyOne.com',
        password: 'Simple_123@',
        addressLine1: 'Manorama Jn.',
        addressLine2: 'Vytila',
        addressLine3: 'Ernakulam',
        addressLine4: 'Ernakulam South',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(updatedUserResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: create a user with existing email Id', async() => {

    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Alex Josep',
        mobile: '+9112554478',
        email: 'joseph.alex@fivebyOne.com',
        password: 'Simple_123@',
        addressLine1: 'Manorama Jn.',
        addressLine2: 'Vytila',
        addressLine3: 'Ernakulam',
        addressLine4: 'Ernakulam South',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(savedUser.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: update email Id of the user', async() => {

    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Joseph Alex',
        mobile: '+91123046007',
        email: 'joseph.alex@fivebyOne.com',
        password: 'Simple_123@',
        addressLine1: 'Manorama Jn.',
        addressLine2: 'Vytila',
        addressLine3: 'Ernakulam',
        addressLine4: 'Ernakulam South',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'
      });
    expect(savedUser.status).toBe(HTTP_OK);
    expect(savedUser.body).toHaveProperty('_id');
    const updatedUserResponse = await request(app).put(`${AuthUris.USER_URI}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Palarivattam Sasi',
        mobile: '+919447311694',
        email: 'daniel.craig@palarivattom.com',
        password: 'Simple_123@',
        addressLine1: 'Castle Royale',
        addressLine2: 'Opp. Watch House',
        addressLine3: 'Palayam',
        addressLine4: 'TVM',
        state: 'Keralam',
        country: 'Bharatham',
        pinCode: '2255'
      });
    expect(updatedUserResponse.status).toBe(HTTP_OK);
    const validResponse = await request(app).get(`${AuthUris.USER_URI}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(validResponse.status).toBe(HTTP_OK);
    const user: UserEntity = validResponse.body;
    expect(user.name).toBe('Palarivattam Sasi');
    expect(user.mobile).toBe('+919447311694');
    expect(user.email).toBe('joseph.alex@fivebyOne.com');
    expect(user.addressLine1).toBe('Castle Royale');
    expect(user.addressLine2).toBe('Opp. Watch House');
    expect(user.addressLine3).toBe('Palayam');
    expect(user.addressLine4).toBe('TVM');
    expect(user.state).toBe('Keralam');
    expect(user.country).toBe('Bharatham');
    expect(user.pinCode).toBe('2255');

  });

  it('SHOULD: delete user with valid Id', async() => {

    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
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
        pinCode: '223344'
      });
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app)['delete'](`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

  });

  it('SHOULD NOT: delete a user with invalid Id', async() => {

    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
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
        pinCode: '223344'
      });
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app)['delete'](`${AuthUris.USER_URI}/${'abc'}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: send a bad request for user already deleted', async() => {

    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
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
        pinCode: '223344'
      });
    expect(response.status).toBe(HTTP_OK);

    const deletedResponse = await request(app)['delete'](`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(deletedResponse.status).toBe(HTTP_OK);
    const alreadydeletedUserRes = await request(app)['delete'](`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(alreadydeletedUserRes.status).toBe(HTTP_BAD_REQUEST);

  });

});
