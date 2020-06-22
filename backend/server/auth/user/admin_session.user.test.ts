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
import { CompanyModel } from '../company/company.model';

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;


describe(`${AuthUris.USER_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';
  let company: Company = null;

  const createAdminUserAndLogin = async() => {

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
    serverToken = response.body.token;

  };

  const getCompanyData = async(): Promise<Company> => {

    const companyData = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
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


  beforeAll(async() => {

    await createAdminUserAndLogin();
    company = await getCompanyData();

  });

  afterAll(async() => {

    const AdminSchema = AdminUserModel.createModel();
    AdminSchema.deleteMany({});
    await mongoose.disconnect();
    await mongod.stop();

  });

  afterEach(async() => {

    const User = UserModel.createModel(company.code);
    await User.deleteMany({});

  });

  it('SHOULD: save user with valid values.', async() => {

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

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(userJson);
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.USER_URI}/user/admin/${company._id}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);
    const user: UserEntity = validResponse.body;
    expect(user.name).toBe('John Honai');
    expect(user.mobile).toBe('+91123456789');
    expect(user.email).toBe('john.honai@fivebyOne.com');
    expect(user.addressLine1).toBe('Jawahar Nagar');
    expect(user.addressLine2).toBe('TTC');
    expect(user.addressLine3).toBe('Vellayambalam');
    expect(user.addressLine4).toBe('Museum');
    expect(user.state).toBe('Kerala');
    expect(user.country).toBe('India');
    expect(user.pinCode).toBe('223344');

  });

  it('SHOULD NOT: save a user with invalid company Id.', async() => {

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

    const companyData = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Company',
        email: 'office@company.com',
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
    const CompanySchema = CompanyModel.createModel();
    await CompanySchema.remove({ email: 'office@company.com' });
    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${companyData.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(userJson);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: save user without token', async() => {

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

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .send(userJson);
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: with invalid user token.', async() => {

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

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer2 ${serverToken}`)
      .send(userJson);
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });


  it('SHOULD NOT: save user with invalid Email Id', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
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
      });
    expect(response.status).toBe(HTTP_OK);
    const validResponse = await request(app).get(`${AuthUris.USER_URI}/user/admin/${company._id}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);
    const user: UserEntity = validResponse.body;
    expect(user.name).toBe('John Honai');
    expect(user.mobile).toBe('+91123456789');
    expect(user.addressLine1).toBe('Jawahar Nagar');
    expect(user.addressLine2).toBe('TTC');
    expect(user.addressLine3).toBe('Vellayambalam');
    expect(user.addressLine4).toBe('Museum');
    expect(user.state).toBe('Kerala');
    expect(user.country).toBe('India');
    expect(user.pinCode).toBe('223344');

  });

  it('SHOULD NOT: save user with invalid Mobile number', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
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
      });
    expect(response.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.USER_URI}/user/admin/${company._id}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(getResponse.status).toBe(HTTP_OK);
    const userData: UserEntity = getResponse.body;
    expect(userData.mobile).toBe('+917907919930');

  });

  it('SHOULD: save user with minimum valid values.', async() => {

    const minValidResponse = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'John Honai',
        email: 'john.honai@fivebyOne.com',
        password: 'Simple_123@'
      });
    expect(minValidResponse.status).toBe(HTTP_OK);
    const savedMinValidResponse = await request(app).get(`${AuthUris.USER_URI}/user/admin/${company._id}/${minValidResponse.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(savedMinValidResponse.status).toBe(HTTP_OK);
    const user: UserEntity = savedMinValidResponse.body;
    expect(user.name).toBe('John Honai');
    expect(user.email).toBe('john.honai@fivebyOne.com');

  });

  it('SHOULD NOT: save - email is required.', async() => {

    const invalidEmailResponse = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const validEmailResponse = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const sameEmailResponse = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const emptyNameResponse = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const noNameResponse = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const emptyPasswordResponse = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const noPasswordResponse = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const correctPasswordRes = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Sagar Alias Jacky',
        email: 'sagar.alias.jacky@fivebyOne.com',
        mobile: '+91123456789',
        password: 'Simple_@123',
        addressLine1: 'Jawahar Nagar',
        addressLine2: 'TTC',
        addressLine3: 'Vellayambalam',
        addressLine4: 'Museum',
        state: 'Kerala',
        country: 'India',
        pinCode: '223344'

      });
    expect(correctPasswordRes.status).toBe(HTTP_OK);


    const wrongPasswordResponse1 = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const wrongPasswordResponse2 = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const wrongPasswordResponse3 = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const wrongPasswordResponse4 = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const wrongPasswordResponse5 = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const wrongPasswordResponse6 = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const validResponse = await request(app).get(`${AuthUris.USER_URI}/user/admin/${company._id}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

  });

  it('SHOULD NOT: Get a user document with a valid document id but with an invalid company id', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const validResponse = await request(app).get(`${AuthUris.USER_URI}/user/admin/$abc/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: Send BAD REQUEST for a fetch by an invalid user Id', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const validResponse = await request(app).get(`${AuthUris.USER_URI}/user/admin/${company._id}/abc`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: Send BAD REQUEST when fetching a user record already deleted', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const validResponse = await request(app)['delete'](`${AuthUris.USER_URI}/user/admin/${company._id}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);
    const getDeleteUser = await request(app).get(`${AuthUris.USER_URI}/user/admin/${company._id}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(getDeleteUser.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: list all Users', async() => {

    const listAllUserReponse = await request(app)
      .get(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(listAllUserReponse.status).toBe(HTTP_OK);

  });


  it('SHOULD: list Users with an invalid company id', async() => {

    const listAllUserReponse = await request(app)
      .get(`${AuthUris.USER_URI}/user/admin/abc`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(listAllUserReponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: list users without token', async() => {

    const listAllUserReponse = await request(app).get(`${AuthUris.USER_URI}/user/admin/${company._id}`);
    expect(listAllUserReponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: list users with an invalid token', async() => {

    const listAllUserReponse = await request(app).get(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer2 ${serverToken}`);
    expect(listAllUserReponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD: update a user by their id', async() => {

    const savedUser = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const updatedUserBody = await request(app).put(`${AuthUris.USER_URI}/user/admin/${company._id}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const updatedUserResponse = await request(app).get(`${AuthUris.USER_URI}/user/admin/${company._id}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
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

  it('SHOULD NOT: update a user without user token', async() => {

    const savedUser = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
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
    expect(savedUser.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: update a user with an invalid user token', async() => {

    const savedUser = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer2 ${serverToken}`)
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
    expect(savedUser.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD: update a user with two company branches that belong to the user company', async() => {

    const savedUser = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const updatedUserBody = await request(app).put(`${AuthUris.USER_URI}/user/admin/${company._id}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const updatedUserResponse = await request(app).get(`${AuthUris.USER_URI}/user/admin/${company._id}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const updateUser: UserEntity = updatedUserResponse.body;

    expect(updatedUserResponse.status).toBe(HTTP_OK);
    expect(updateUser.name).toBe('Palarivattam Sasi');
    expect(updateUser.mobile).toBe('+917907919932');
    expect(updateUser.email).toBe('newuser@fivebyOne.com');
    expect(updateUser.addressLine1).toBe('Castle Royale');
    expect(updateUser.addressLine2).toBe('Opp. Watch House');
    expect(updateUser.addressLine3).toBe('Palayam');
    expect(updateUser.addressLine4).toBe('TVM');
    expect(updateUser.state).toBe('Kerala');
    expect(updateUser.country).toBe('India');
    expect(updateUser.pinCode).toBe('223344');

  });

  it('SHOULD NOT: update a user with a deleted company', async() => {

    const tempCompanyRes = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Continental Exporters',
        email: 'office@continentalExports.com',
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

    const savedUser = await request(app).post(`${AuthUris.USER_URI}/user/admin/${tempCompanyRes.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
        pinCodee: '223344'
      });
    expect(savedUser.status).toBe(HTTP_OK);
    expect(savedUser.body).toHaveProperty('_id');
    const CompanySchema = CompanyModel.createModel();
    await CompanySchema.deleteOne({ name: 'Continental Exporters' });
    const updatedUserBody = await request(app).put(`${AuthUris.USER_URI}/user/admin/${tempCompanyRes.body._id}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    expect(updatedUserBody.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: update a user with only required fields', async() => {

    const savedUser = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const updatedUserResponse = await request(app).put(`${AuthUris.USER_URI}/user/admin/${company._id}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Palarivattam Sasi'
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

    const savedUser = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(userJson);
    expect(savedUser.status).toBe(HTTP_OK);
    expect(savedUser.body).toHaveProperty('_id');
    const updatedUserResponse = await request(app).put(`${AuthUris.USER_URI}/user/admin/${company._id}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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


    const savedUser = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const updatedUserResponse = await request(app).put(`${AuthUris.USER_URI}/user/admin/${company._id}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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


    const savedUser = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const updatedUserResponse = await request(app).put(`${AuthUris.USER_URI}/user/admin/${company._id}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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


    const savedUser = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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


    const savedUser = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const updatedUserResponse = await request(app).put(`${AuthUris.USER_URI}/user/admin/${company._id}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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
    const validResponse = await request(app).get(`${AuthUris.USER_URI}/user/admin/${company._id}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
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


    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const validResponse = await request(app)['delete'](`${AuthUris.USER_URI}/user/admin/${company._id}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

  });

  it('SHOULD: delete a user with valid Id but with invalid company Id', async() => {


    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const validResponse = await request(app)['delete'](`${AuthUris.USER_URI}/user/admin/abc/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: delete a user without token', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const validResponse = await request(app)['delete'](`${AuthUris.USER_URI}/user/admin/${company._id}/${response.body._id}`);
    expect(validResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: delete a user without token', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const validResponse = await request(app)['delete'](`${AuthUris.USER_URI}/user/admin/${company._id}/${response.body._id}`)
      .set('Authorization', `Bearer2 ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('SHOULD NOT: delete a user with invalid Id', async() => {


    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}/`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const validResponse = await request(app)['delete'](`${AuthUris.USER_URI}/user/admin/${company._id}/${'abc'}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: send a bad request for user already deleted', async() => {


    const response = await request(app).post(`${AuthUris.USER_URI}/user/admin/${company._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
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

    const deletedResponse = await request(app)['delete'](`${AuthUris.USER_URI}/user/admin/${company._id}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(deletedResponse.status).toBe(HTTP_OK);
    const alreadydeletedUserRes = await request(app)['delete'](`${AuthUris.USER_URI}/user/admin/${company._id}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(alreadydeletedUserRes.status).toBe(HTTP_BAD_REQUEST);

  });

});
