/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import {UserModel} from './user.model';
import Company from '../company/company.model';
import CompanyBranchM from '../companyBranch/companyBranch.model';
import {
  Constants, AuthUris, Company as CompanyEntity,
  User as UserEntity, CompanyS as CompanyI,
  CompanyBranchS as companyBranchI, CompanyBranch as CompanyBranchEntity
} from 'fivebyone';

const { HTTP_OK, HTTP_BAD_REQUEST } = Constants;
const companyInputJSON: CompanyI = {
  name: 'Xpedtions Pvt. Ltd.',
  email: 'office@xpeditions.org',
  addressLine1: 'PMG Road',
  addressLine2: 'Near PMG signal',
  addressLine3: 'Opp. BSNL',
  addressLine4: 'TVM',
  state: 'Tamil Nadu',
  country: 'India',
  pincode: '223344',
  contact: '1234567890',
  phone: '1234567890',
};
const companyBranchInput: companyBranchI = {
  company: null,
  name: null,
  addressLine1: 'Panvel - Kochi - Kanyakumari Highway',
  addressLine2: 'Vikas Nagar',
  addressLine3: 'Maradu',
  addressLine4: 'Ernakulam',
  contact: '7907919930',
  phone: '9656444108',
  email: 'contactUs@rajasreeKochi.com',
  state: 'Kerala',
  country: 'India',
  pincode: '685588',
  finYears: [ {
    name: '2019-20',
    startDate: '2019-02-01',
    endDate: '2020-02-01'
  } ]
};


describe(`${AuthUris.USER_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';

  const createCompanyBranch = async(companyBrInput: companyBranchI): Promise<CompanyBranchEntity> => {

    const companyBranch = new CompanyBranchM(companyBrInput);
    await companyBranch.save();
    const companyBranchEntity: CompanyBranchEntity = await CompanyBranchM.findOne({ name: companyBranch.name });
    return companyBranchEntity;

  };

  const createTestUser = async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });
    const company = new Company(companyInputJSON);
    await company.save();
    const User = UserModel.createModel(process.env.COMMON_DB, null);
    const user = new User();
    user.name = 'Test User';
    user.email = 'test@email.com';
    user.company = company;
    companyBranchInput.company = company;
    companyBranchInput.name = 'five.byOne';
    const companyBranch = await createCompanyBranch(companyBranchInput);
    user.companyBranches = [ companyBranch ];
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

    const User = UserModel.createModel(process.env.COMMON_DB, null);
    await User.remove({});

  });

  it('SHOULD NOT: login with an invalid user', async() => {

    const response = await request(app).post(`${AuthUris.USER_URI}/login`)
      .send({
        email: 'test@email.com',
        password: 'Simple_12@'
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: save user with valid values.', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

    const userJson = {
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
      companyBranches: [ companyBranch ]
    };

    const response = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(userJson);
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
    expect(user.companyBranches.length.toString()).toBe('1');

  });


  it('SHOULD NOT: save user without company branch', async() => {

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
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: save without company key', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
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
        pinCode: '223344',
        companyBranches: [ getCompanyRes._id ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: save without defining company', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);
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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: save user with invalid Email Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);
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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: save a user with valid Email Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
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
    expect(user.companyBranches.length.toString()).toBe('1');

  });

  it('SHOULD NOT: save user with invalid Mobile number', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: save user with valid Mobile number', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(response1.status).toBe(HTTP_OK);
    const getResponse = await request(app).get(`${AuthUris.USER_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(getResponse.status).toBe(HTTP_OK);
    const userData: UserEntity = getResponse.body;
    expect(userData.mobile).toBe('+917907919930');

  });

  it('SHOULD: save user with minimum valid values.', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

    const minValidResponse = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        company: getCompanyRes,
        name: 'John Honai',
        email: 'john.honai@fivebyOne.com',
        password: 'Simple_123@',
        companyBranches: [ companyBranch ]
      });
    expect(minValidResponse.status).toBe(HTTP_OK);
    const savedMinValidResponse = await request(app).get(`${AuthUris.USER_URI}/${minValidResponse.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(savedMinValidResponse.status).toBe(HTTP_OK);
    const user: UserEntity = savedMinValidResponse.body;
    expect(user.name).toBe('John Honai');
    expect(user.email).toBe('john.honai@fivebyOne.com');
    expect(user.company._id.toString()).toBe(getCompanyRes._id.toString());
    expect(user.companyBranches.length.toString()).toBe('1');

  });

  it('SHOULD NOT: save - email is required.', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(invalidEmailResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: save - email should be unique.', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
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
        pinCode: '223344',
        companyBranches: [ getCompanyRes._id ]
      });
    expect(sameEmailResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: save - name is required.', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(noNameResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: save with empty password', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]

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
    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]

      });
    expect(wrongPasswordResponse6.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: Save a user record and get it by its id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        companyBranches: [ companyBranch ]
      });
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

  });

  it('SHOULD: Send BAD REQUEST for a fetch by an invalid user Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        companyBranches: [ companyBranch ]
      });
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app).get(`${AuthUris.USER_URI}/abc`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: Send BAD REQUEST when fetching a user record already deleted', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        companyBranches: [ companyBranch ]
      });
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app)['delete'](`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);
    const getDeleteUser = await request(app).get(`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(getDeleteUser.status).toBe(HTTP_BAD_REQUEST);

  });


  it('SHOULD: list all Users', async() => {

    const listAllUserReponse = await request(app).get(`${AuthUris.USER_URI}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(listAllUserReponse.status).toBe(HTTP_OK);

  });


  it('SHOULD: update a user by their id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
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

  it('SHOULD: update a user with two company branches that belong to the user company', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch1: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);
    const companyBranchInput2: any = JSON.parse(JSON.stringify(companyBranchInput));
    companyBranchInput2.name = 'Space Mine';
    companyBranchInput2.company = getCompanyRes;
    const companyBranch2: CompanyBranchEntity = await createCompanyBranch(companyBranchInput2);
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
        pinCode: '223344',
        companyBranches: [ companyBranch1 ]
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
        pinCode: '223344',
        companyBranches: [ companyBranch1, companyBranch2 ]
      });
    expect(updatedUserBody.status).toBe(HTTP_OK);
    const updatedUserResponse = await request(app).get(`${AuthUris.USER_URI}/${savedUser.body._id}`)
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
    expect(updateUser.company._id.toString()).toBe(getCompanyRes._id.toString());
    expect(updateUser.companyBranches.length.toString()).toBe('2');

  });

  it('SHOULD NOT: update a user without company', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(updatedUserBody.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: update a user with a deleted company', async() => {

    const company = JSON.parse(JSON.stringify(companyInputJSON));
    company.name = 'Test Company';
    company.email = 'contact@testCompany.com';
    const testCompanyRes = await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(company);
    const getCompanyRes = await request(app).get(`${AuthUris.COMPANY_URI}/${testCompanyRes.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(testCompanyRes.status).toBe(HTTP_OK);
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes.body;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCodee: '223344',
        companyBranches: [ companyBranch ]
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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(updatedUserBody.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: update a user with only required fields', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(updatedUserResponse.status).toBe(HTTP_OK);
    expect(updatedUserResponse.body.name).toBe('Palarivattam Sasi');

  });

  it('SHOULD: update a user with valid mobile number', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

    const userJson = {
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
      companyBranches: [ companyBranch ]
    };

    const savedUser = await request(app).post(AuthUris.USER_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(userJson);
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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(updatedUserResponse.status).toBe(HTTP_OK);
    const userEntity: UserEntity = updatedUserResponse.body;
    expect(userEntity.mobile).toBe('+919447311694');

  });

  it('SHOULD NOT: update a user with invalid mobile number', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(updatedUserResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: update a user with empty name', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(updatedUserResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: create a user with existing email Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
      });
    expect(savedUser.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD NOT: update email Id of the user', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        pinCode: '223344',
        companyBranches: [ companyBranch ]
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
        pinCode: '2255',
        companyBranches: [ companyBranch ]
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


  it('SHOULD: delete user with valid Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        companyBranches: [ companyBranch ]
      });
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app)['delete'](`${AuthUris.USER_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_OK);

  });

  it('SHOULD NOT: delete a user with invalid Id', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        companyBranches: [ companyBranch ]
      });
    expect(response.status).toBe(HTTP_OK);

    const validResponse = await request(app)['delete'](`${AuthUris.USER_URI}/${'abc'}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(validResponse.status).toBe(HTTP_BAD_REQUEST);

  });

  it('SHOULD: send a bad request for user already deleted', async() => {

    const getCompanyRes: CompanyEntity = await Company.findOne({ name: companyInputJSON.name });
    companyBranchInput.name = 'Dream works';
    companyBranchInput.company = getCompanyRes;
    const companyBranch: CompanyBranchEntity = await createCompanyBranch(companyBranchInput);

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
        companyBranches: [ companyBranch ]
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
