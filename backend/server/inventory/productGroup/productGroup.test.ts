/* eslint {max-lines-per-function: 0, max-statements:0, max-lines:0} */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import User from '../../auth/user/user.model';
import ProductGroup from './productGroup.model';
import Company from '../../auth/company/company.model';
import CompanyBranchM from '../../auth/companyBranch/companyBranch.model';
import {Constants, ProductGroup as ProductGroupEntity, InventoryUris, AuthUris, CompanyS as CompanyI, CompanyBranchS, CompanyBranch} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;
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
const companyBranchInput: CompanyBranchS = {
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

describe(`${InventoryUris.PRODUCT_GROUP_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';
  const createCompanyBranch = async(companyBrInput: CompanyBranchS): Promise<CompanyBranch> => {

    const companyBranch = new CompanyBranchM(companyBrInput);
    await companyBranch.save();
    const companyBranchEntity: CompanyBranch = await CompanyBranchM.findOne({ name: companyBranch.name });
    return companyBranchEntity;

  };

  const createTestUser = async() => {

    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
    });
    const company = new Company(companyInputJSON);
    await company.save();
    await request(app).post(AuthUris.COMPANY_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(companyInputJSON);
    const user = new User();
    user.email = 'test@email.com';
    user.name = 'Test User';
    user.company = company;
    companyBranchInput.company = company;
    companyBranchInput.name = 'five.byOne';
    const companyBranch = await createCompanyBranch(companyBranchInput);
    user.companyBranches = [ companyBranch ];
    user.setPassword('Simple_123@');
    await user.save();

  };
  // Connect to mongoose mock, create a test user and get the access token
  beforeAll(async() => {

    await createTestUser();
    const response = await request(app).post(`${AuthUris.USER_URI}/login`)
      .send({
        email: 'test@email.com',
        password: 'Simple_123@',
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
  // Create a sample item
  beforeEach(async() => {

    /*
     * Const productGroup = new ProductGroup();
     * productGroup.name = 'Product Group Name';
     * productGroup.shortName = 'Short Name';
     * await productGroup.save();
     */

  });

  // Remove sample items
  afterEach(async() => {

    await ProductGroup.remove({});

  });


  it('Shoule save a new productGroup with valid values', async() => {

    const response = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
      });
    expect(response.status).toBe(HTTP_OK);
    const savedProductGroup: ProductGroupEntity = response.body;
    const savedProductGroup2: ProductGroupEntity = await ProductGroup.findById(savedProductGroup._id).populate('parent');
    expect(savedProductGroup2.name).toBe('Product Group Name 2');
    expect(savedProductGroup2.shortName).toBe('Short Name 2');
    expect(savedProductGroup2.ancestors.length).toBe(0);

  });


  it('Shoule save a new productGroup after trim', async() => {

    const response = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: ' Product Group Name 2 ',
        shortName: ' Short Name 2 ',
      });
    expect(response.status).toBe(HTTP_OK);
    const savedProductGroup: ProductGroupEntity = response.body;
    const savedProductGroup2: ProductGroupEntity = await ProductGroup.findById(savedProductGroup._id).populate('parent');
    expect(savedProductGroup2.name).toBe('Product Group Name 2');
    expect(savedProductGroup2.shortName).toBe('Short Name 2');
    expect(savedProductGroup2.ancestors.length).toBe(0);

  });

  it('Should not save new product group with empty values', async() => {

    const response = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({});
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product group with empty name', async() => {

    const response = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: '',
        shortName: 'Short Name 2',
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product group without name', async() => {

    const response = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        shortName: 'Short Name 2',
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product group with duplicate name', async() => {

    const response = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Name 1',
        shortName: 'Short Name 1',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Name 1',
        shortName: 'Short Name 2',
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product group with invalid parent', async() => {

    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 2',
        shortName: 'Short Name 2',
      });
    expect(response2.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = response2.body;

    await ProductGroup.deleteOne({_id: savedProductGroup2._id});

    const response = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 3',
        shortName: 'Short Name 3',
        parent: savedProductGroup2._id,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save product group with valid parent', async() => {

    const response1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 1',
        shortName: 'Short Name 1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup1: ProductGroupEntity = response1.body;

    // Level one parent
    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 2',
        shortName: 'Short Name 2',
        parent: savedProductGroup1._id,
      });
    expect(response2.status).toBe(HTTP_OK);

    const savedProductGroup2: ProductGroupEntity = await ProductGroup.findById(response2.body._id).populate('parent');
    expect(savedProductGroup2.name).toBe('Group Name 2');
    expect(savedProductGroup2.shortName).toBe('Short Name 2');
    expect(savedProductGroup2.parent.name).toBe(savedProductGroup1.name);
    expect(savedProductGroup2.ancestors.length).toBe(1);
    expect(savedProductGroup2.ancestors[0]).toBe(savedProductGroup1._id);

    // Level two parent
    const response3 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 3',
        shortName: 'Short Name 3',
        parent: savedProductGroup2._id,
      });
    expect(response3.status).toBe(HTTP_OK);
    const savedProductGroup3: ProductGroupEntity = await ProductGroup.findById(response3.body._id).populate('parent');
    expect(savedProductGroup3.name).toBe('Group Name 3');
    expect(savedProductGroup3.shortName).toBe('Short Name 3');
    expect(savedProductGroup3.parent.name).toBe(savedProductGroup2.name);
    const ancestorsLength = 2;
    expect(savedProductGroup3.ancestors.length).toBe(ancestorsLength);
    expect(savedProductGroup3.ancestors[0]).toBe(savedProductGroup1._id);
    expect(savedProductGroup3.ancestors[1]).toBe(response2.body._id);

  });

  it('Should list all product groups', async() => {

    const response1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name',
        shortName: 'Short Name',
      });
    expect(response1.status).toBe(HTTP_OK);
    const response = await request(app).get(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_OK);
    const listedProductGroups: ProductGroupEntity[] = response.body;
    expect(listedProductGroups.length).toEqual(1);
    expect(listedProductGroups).toEqual([
      expect.objectContaining({
        name: 'Product Group Name',
        shortName: 'Short Name',
        ancestors: [],
      }),
    ]);

  });

  it('Shoudl get a specific product group by id', async() => {

    const response = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
      });
    expect(response.status).toBe(HTTP_OK);
    const savedProductGroup: ProductGroupEntity = response.body;
    const response2 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${savedProductGroup._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = response2.body;
    expect(savedProductGroup2).toEqual(
      expect.objectContaining({
        _id: savedProductGroup._id,
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
        ancestors: [],
      }),
    );

  });

  it('Should not get any product group with invalid id', async() => {

    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
      });
    expect(response2.status).toBe(HTTP_OK);
    await ProductGroup.deleteOne({_id: response2.body.id});

    const response = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${response2.body.id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should update product group with valid values', async() => {

    const response1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-1',
        shortName: 'Short Name 1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup1: ProductGroupEntity = response1.body;
    savedProductGroup1.name = 'Name-1';
    const response2 = await request(app).put(`${InventoryUris.PRODUCT_GROUP_URI}/${savedProductGroup1._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send(savedProductGroup1);
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${savedProductGroup1._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = response3.body;
    expect(savedProductGroup2).toEqual(
      expect.objectContaining({
        _id: savedProductGroup1._id,
        name: 'Name-1',
        shortName: 'Short Name 1',
        ancestors: [],
      }),
    );

  });


  it('Should update product group after trim', async() => {

    const response1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-1',
        shortName: 'Short Name 1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup1: ProductGroupEntity = response1.body;
    // SavedProductGroup1.name = 'Name-1';
    const response2 = await request(app).put(`${InventoryUris.PRODUCT_GROUP_URI}/${savedProductGroup1._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: ' Parent2-1 ',
        shortName: ' Name 1 ',
      });
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${savedProductGroup1._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = response3.body;
    expect(savedProductGroup2).toEqual(
      expect.objectContaining({
        _id: savedProductGroup1._id,
        name: 'Parent2-1',
        shortName: 'Name 1',
        ancestors: [],
      }),
    );

  });

  it('Should update product group with valid parent', async() => {

    const response1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup1: ProductGroupEntity = response1.body;

    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-2',
      });
    expect(response2.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = response2.body;

    const response3 = await request(app).put(`${InventoryUris.PRODUCT_GROUP_URI}/${savedProductGroup1._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 1',
        parent: savedProductGroup2,
      });
    expect(response3.status).toBe(HTTP_OK);

    const response4 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${savedProductGroup1._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_OK);
    const savedProductGroup4: ProductGroupEntity = response4.body;
    expect(savedProductGroup4.name).toBe('Group Name 1');
    expect(savedProductGroup4.parent.name).toBe(savedProductGroup2.name);
    expect(savedProductGroup4.ancestors.length).toBe(1);
    expect(savedProductGroup4.ancestors[0]).toBe(savedProductGroup2._id);

  });

  it('Should update product group with valid id of parent', async() => {

    const response1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup1: ProductGroupEntity = response1.body;

    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-2',
      });
    expect(response2.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = response2.body;

    const response3 = await request(app).put(`${InventoryUris.PRODUCT_GROUP_URI}/${savedProductGroup1._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 1',
        parent: savedProductGroup2._id,
      });
    expect(response3.status).toBe(HTTP_OK);

    const response4 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${savedProductGroup1._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_OK);
    const savedProductGroup4: ProductGroupEntity = response4.body;
    expect(savedProductGroup4.name).toBe('Group Name 1');
    expect(savedProductGroup4.parent.name).toBe(savedProductGroup2.name);
    expect(savedProductGroup4.ancestors.length).toBe(1);
    expect(savedProductGroup4.ancestors[0]).toBe(savedProductGroup2._id);

  });

  it('cant update productGroup if there is circular relation with parent', async() => {

    const response1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-1',
      });
    expect(response1.status).toBe(HTTP_OK);

    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-2',
        parent: response1.body._id,
      });
    expect(response2.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = await ProductGroup.findById(response2.body._id).populate('parent');
    expect(savedProductGroup2.parent.name).toBe('Parent-1');
    expect(savedProductGroup2.ancestors.length).toBe(1);
    expect(savedProductGroup2.ancestors[0]).toBe(response1.body._id);

    const response3 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-3',
        parent: response2.body._id,
      });
    expect(response3.status).toBe(HTTP_OK);
    const savedProductGroup3: ProductGroupEntity = await ProductGroup.findById(response3.body._id).populate('parent');
    expect(savedProductGroup3.parent.name).toBe('Parent-2');
    const ancestorsLength = 2;
    expect(savedProductGroup3.ancestors.length).toBe(ancestorsLength);
    expect(savedProductGroup3.ancestors[0]).toBe(response1.body._id);
    expect(savedProductGroup3.ancestors[1]).toBe(response2.body._id);

    const response4 = await request(app).put(`${InventoryUris.PRODUCT_GROUP_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Parent-1-New',
        parent: savedProductGroup3,
      });
    expect(response4.status).toBe(HTTP_BAD_REQUEST);
    const savedProductGroup1New: ProductGroupEntity = await ProductGroup.findById(response1.body._id).populate('parent');
    expect(savedProductGroup1New.name).toBe('Parent-1');
    expect(savedProductGroup1New.ancestors.length).toBe(0);
    expect(!savedProductGroup1New.parent).toBe(true);

  });

  it('Should not update product group with invalid parent', async() => {

    const response = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name',
        shortName: 'Short Name',
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
      });
    expect(response2.status).toBe(HTTP_OK);
    const response4 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_OK);
    const savedProductGroup4: ProductGroupEntity = response4.body;
    await ProductGroup.deleteOne({_id: response2.body._id});

    const response3 = await request(app).put(`${InventoryUris.PRODUCT_GROUP_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Group Name 1',
        parent: savedProductGroup4,
      });
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update product group with duplicate name', async() => {

    const response = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name',
        shortName: 'Short Name',
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).put(`${InventoryUris.PRODUCT_GROUP_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name',
        shortName: 'Short Name 2',
      });
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should remove parent by updating product group', async() => {

    const response1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 1',
        shortName: 'Short Name 1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup1: ProductGroupEntity = response1.body;
    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
        parent: savedProductGroup1
      });
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const savedProductGroup2: ProductGroupEntity = response3.body;
    expect(savedProductGroup2.name).toBe('Product Group Name 2');
    expect(savedProductGroup2.parent.name).toBe('Product Group Name 1');

    const response4 = await request(app).put(`${InventoryUris.PRODUCT_GROUP_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name Updated 2',
        shortName: 'Short Name 2',
        parent: null,
      });
    expect(response4.status).toBe(HTTP_OK);
    const response5 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);

    expect(response5.status).toBe(HTTP_OK);
    const updatedProductGroup2: ProductGroupEntity = response5.body;
    expect(updatedProductGroup2.name).toBe('Product Group Name Updated 2');
    expect(!updatedProductGroup2.parent).toBe(true);
    expect(updatedProductGroup2.ancestors.length).toBe(0);

  });

  it('Should not delete product group if it is a parent.', async() => {

    const response1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 1',
        shortName: 'Short Name 1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup1: ProductGroupEntity = response1.body;
    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
        parent: savedProductGroup1
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app)['delete'](`${InventoryUris.PRODUCT_GROUP_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Ancestors should be changed when a parent is changed.', async() => {

    const response1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 1',
        shortName: 'Short Name 1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup1: ProductGroupEntity = response1.body;
    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
        parent: savedProductGroup1
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 3',
        shortName: 'Short Name 3',
      });
    expect(response3.status).toBe(HTTP_OK);
    const savedProductGroup3: ProductGroupEntity = response3.body;

    const response4 = await request(app).put(`${InventoryUris.PRODUCT_GROUP_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name Updated 2',
        shortName: 'Short Name 2',
        parent: savedProductGroup3,
      });
    expect(response4.status).toBe(HTTP_OK);

    const response5 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${response2.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response5.status).toBe(HTTP_OK);
    const updatedProductGroup: ProductGroupEntity = response5.body;
    expect(updatedProductGroup.name).toBe('Product Group Name Updated 2');
    expect(updatedProductGroup.parent.name).toBe('Product Group Name 3');
    expect(updatedProductGroup.ancestors.length).toBe(1);
    expect(updatedProductGroup.ancestors[0]).toBe(response3.body._id);

  });

  it('Should delete product group with valid id', async() => {

    const response = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
      });
    expect(response.status).toBe(HTTP_OK);
    const savedProductGroup: ProductGroupEntity = response.body;

    const response3 = await request(app)['delete'](`${InventoryUris.PRODUCT_GROUP_URI}/${savedProductGroup._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);

    const response4 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${savedProductGroup._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should handle delete of product groups with invalid id', async() => {

    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
      });
    expect(response2.status).toBe(HTTP_OK);
    await ProductGroup.deleteOne({_id: response2.body.id});
    const response3 = await request(app)['delete'](`${InventoryUris.PRODUCT_GROUP_URI}/${response2.body.id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not delete a parent when a child deletes', async() => {

    const response1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 1',
        shortName: 'Short Name 1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const savedProductGroup: ProductGroupEntity = response1.body;

    const response2 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
        parent: savedProductGroup,
      });
    expect(response2.status).toBe(HTTP_OK);
    const savedProductGroup2: ProductGroupEntity = await ProductGroup.findById(response2.body._id).populate('parent');
    expect(savedProductGroup2.ancestors.length).toBe(1);
    expect(savedProductGroup2.parent.name).toBe('Product Group Name 1');

    await ProductGroup.deleteOne({_id: response2.body._id});
    const response4 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const productGroupAfterDeleteChild: ProductGroupEntity = response4.body;
    expect(response4.status).toBe(HTTP_OK);
    expect(productGroupAfterDeleteChild.name).toBe('Product Group Name 1');

  });

  it('Should not delete a product group if it is assigned to a product', async() => {

    const response1 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group Name 1',
        shortName: 'Short Name 1',
      });
    expect(response1.status).toBe(HTTP_OK);
    const response2 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const savedProductGroup: ProductGroupEntity = response2.body;

    const response3 = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: savedProductGroup,
        name: 'Product One',
        shortName: 'Short Name 1',
      });
    expect(response3.status).toBe(HTTP_OK);

    const response4 = await request(app)['delete'](`${InventoryUris.PRODUCT_GROUP_URI}/${response1.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response4.status).toBe(HTTP_BAD_REQUEST);

  });

});
