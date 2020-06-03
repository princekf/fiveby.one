/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import User from './user.model';
import Company from '../company/company.model';
import { Constants, AuthUris, Company as CompanyEntity, User as UserEntity, CompanyS as CompanyI } from 'fivebyone';

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

describe(`${AuthUris.USER_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';
  const createTestUser = async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });
    const company = new Company(companyInputJSON);
    await company.save();
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

    await User.remove({});

  });

  it('Should not login with an invalid user', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}/login`)
      .send({
        email: 'test@email.com',
        password: 'Simple_12@'
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save user with valid values.', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      });
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.USER_URI}/${response.body._id}`)
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
    expect(user.company._id.toString()).toBe(getCompanyRes._id.toString());

  });

  it('Should not save without company key', async() => {

    const response = await request(app).post(AuthUris.USER_URI)
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

  it('Should not save without defining company', async() => {

    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: null,
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

  it('Should not save user with invalid Email Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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

  it('Should save a user with valid Email Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
    const validResponse = await request(app).get(`${AuthUris.USER_URI}/${response.body._id}`)
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
    expect(user.company._id.toString()).toBe(getCompanyRes._id.toString());

  });

  it('Should not save user with invalid Mobile number', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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

  it('Should save user with valid Mobile number', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response1 = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
    expect(response1.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.USER_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(getResponse.status).toBe(HTTP_OK);
    const userData: UserEntity = getResponse.body;
    expect(userData.mobile).toBe('+917907919930');

  });

  it('Should save user with minimum valid values.', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const minValidResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
        name: 'John Honai',
        email: 'john.honai@fivebyOne.com',
        password: 'Simple_123@'
      });
    expect(minValidResponse.status).toBe(HTTP_OK);
    const savedMinValidResponse = await request(app).get(`${AuthUris.USER_URI}/${minValidResponse.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(savedMinValidResponse.status).toBe(HTTP_OK);
    const user: UserEntity = savedMinValidResponse.body;
    expect(user.name).toBe('John Honai');
    expect(user.email).toBe('john.honai@fivebyOne.com');
    expect(user.company._id.toString()).toBe(getCompanyRes._id.toString());

  });

  it('Should not save - email is required.', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const invalidEmailResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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

  it('Should not save - email should be unique.', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const validEmailResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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

  it('Should not save - name is required.', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const emptyNameResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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

  it('Should not save with empty password', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const emptyPasswordResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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


  it('Should not save - if password doesn\'t match the confirmed standards', async() => {

    /*
     *  Aa_1
     * aabb_c1
     * AAABB_C1
     * abcdA_CC
     * abcdA1CC
     */
    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const wrongPasswordResponse1 = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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

  it('Save a user record and get it by it\'s id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

  });

  it('Send BAD REQUEST for a fetch by an invalid user Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Send BAD REQUEST when fetching a user record already deleted', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);
    const getDeleteUser = await request(app).get(`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(getDeleteUser.status).toBe(HTTP_BAD_REQUEST);

  });


  it('Should list all Users', async() => {

    const listAllUserReponse = await request(app).get(`${AuthUris.USER_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(listAllUserReponse.status).toBe(HTTP_OK);

  });


  it('Should update a user by their id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
    expect(updatedUserResponse.body.company._id.toString()).toBe(getCompanyRes._id.toString());

  });

  it('Should not update a user without company', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: null,
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

  it('Should not update a user with a deleted company', async() => {

    const company = JSON.parse(JSON.stringify(companyInputJSON));
    company.name = 'Test Company';
    company.email = 'contact@testCompany.com';
    const testCompanyRes = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(company);
    const getCompanyRes = await request(app).get(`${AuthUris.COMPANY_URI}/${testCompanyRes.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(testCompanyRes.status).toBe(HTTP_OK);
    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes.body,
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
    await Company.deleteOne({ name: company.name });
    const updatedUserBody = await request(app).put(`${AuthUris.USER_URI}/${savedUser.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes.body,
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

  it('Should update a user with only required fields', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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

  it('Should update a user with valid mobile number', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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

  it('Should not update a user with invalid mobile number', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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

  it('Should not update a user with empty name', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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

  it('Should not create a user with existing email Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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

  it('Should not update email Id of the user', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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


  it('Should delete user with valid Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

  });

  it('Should not delete a user with invalid Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should send a bad request for user already deleted', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
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
      .set('Authorization', `Bearer ${serverToken}`);
    expect(deletedResponse.status).toBe(HTTP_OK);
    const alreadydeletedUserRes = await request(app)['delete'](`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(alreadydeletedUserRes.status).toBe(HTTP_BAD_REQUEST);

  });

});
