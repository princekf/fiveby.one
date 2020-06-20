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
  InventoryUris,
  Product as ProductEntity,
  ProductGroup
} from 'fivebyone';
import { ProductModel } from './product.model';
import { ProductGroupModel } from '../productGroup/productGroup.model';

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;


describe(`${InventoryUris.PRODUCT_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let adminToken = '';
  let clientToken = '';
  let company: Company = null;
  let productGroup: ProductGroup = null;

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
    const response = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Product Group',
        shortName: 'PG',
      });
    productGroup = response.body;

  });

  afterEach(async() => {

    const User = UserModel.createModel(company.code);
    await User.deleteMany({});
    const ProductGroupMod = ProductGroupModel.createModel(company.code);
    await ProductGroupMod.deleteMany({});
    const ProductMod = ProductModel.createModel(company.code);
    await ProductMod.deleteMany({});

  });

  it('Should save product with valid values', async() => {

    const reOrderLevelValue = 100;
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);

    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: reOrderLevelValue,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).get(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const savedProducts: ProductEntity[] = response2.body;
    const [ savedProduct ] = savedProducts;
    expect(savedProduct.name).toBe('Product One');
    expect(savedProduct.code).toBe('Code One');
    expect(savedProduct.shortName).toBe('PO');
    expect(savedProduct.brand).toBe('FBO');
    expect(savedProduct.location).toBe('Rack 1');
    expect(savedProduct.barcode).toBe('87654321');
    expect(savedProduct.unit).toBe('Number');
    expect(savedProduct.reorderLevel).toBe(reOrderLevelValue);
    expect(savedProduct.hasBatch).toBe(true);
    const colorLength = 2;
    expect(savedProduct.colors.length).toBe(colorLength);
    expect(savedProduct.colors[0]).toBe('Black');
    expect(savedProduct.colors[1]).toBe('White');
    expect(savedProduct.group.name).toBe('Product Group');

  });

  it('Should not save a product with an invalid token', async() => {

    const reOrderLevelValue = 100;
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);

    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer2 ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: reOrderLevelValue,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not save a product with an invalid token', async() => {

    const reOrderLevelValue = 100;
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);

    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .send({
        group: productGroupEntity,
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: reOrderLevelValue,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should save product after trimming', async() => {

    const reOrderLevelValue = 100;
    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);

    const productGroupEntity: ProductGroup = productGroupRes.body;
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: ' Product One ',
        code: ' Code One ',
        shortName: ' PO ',
        brand: ' FBO ',
        location: ' Rack 1 ',
        barcode: ' 87654321 ',
        unit: ' Number ',
        reorderLevel: reOrderLevelValue,
        colors: [ ' Black ', ' White ' ],
        hasBatch: true,
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).get(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const savedProducts: ProductEntity[] = response2.body;
    const [ savedProduct ] = savedProducts;
    expect(savedProduct.name).toBe('Product One');
    expect(savedProduct.code).toBe('Code One');
    expect(savedProduct.shortName).toBe('PO');
    expect(savedProduct.brand).toBe('FBO');
    expect(savedProduct.location).toBe('Rack 1');
    expect(savedProduct.barcode).toBe('87654321');
    expect(savedProduct.unit).toBe('Number');
    expect(savedProduct.reorderLevel).toBe(reOrderLevelValue);
    expect(savedProduct.hasBatch).toBe(true);
    const colorLength = 2;
    expect(savedProduct.colors.length).toBe(colorLength);
    expect(savedProduct.colors[0]).toBe('Black');
    expect(savedProduct.colors[1]).toBe('White');
    expect(savedProduct.group.name).toBe('Product Group');

  });


  it('Should not save product with invalid group', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    await request(app)['delete'](`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: 100,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product without group', async() => {

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: 100,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product with empty name', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: '',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: 100,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product without name', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: 100,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product with duplicate name', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Name One',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: 100,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Name One',
        code: 'Code One 2',
        shortName: 'PO2',
        brand: 'FBO2',
        location: 'Rack 12',
        barcode: '876543212',
        unit: 'Number2',
        reorderLevel: 1002,
        colors: [ 'Black2', 'White2' ],
        hasBatch: false,
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not save product with negative reorder level', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response2 = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Name One',
        code: 'Code One 2',
        shortName: 'PO2',
        brand: 'FBO2',
        location: 'Rack 12',
        barcode: '876543212',
        unit: 'Number2',
        reorderLevel: -1,
        colors: [ 'Black2', 'White2' ],
        hasBatch: false,
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should save product, only group and name are mandatory', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;
    const response2 = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Name One',
      });
    expect(response2.status).toBe(HTTP_OK);

  });

  it('Should get a product with valid id', async() => {

    const reOrderLevelValue = 100;
    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: reOrderLevelValue,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).get(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const savedProduct: ProductEntity = response2.body;
    expect(savedProduct.name).toBe('Product One');
    expect(savedProduct.code).toBe('Code One');
    expect(savedProduct.shortName).toBe('PO');
    expect(savedProduct.brand).toBe('FBO');
    expect(savedProduct.location).toBe('Rack 1');
    expect(savedProduct.barcode).toBe('87654321');
    expect(savedProduct.unit).toBe('Number');
    expect(savedProduct.reorderLevel).toBe(reOrderLevelValue);
    expect(savedProduct.hasBatch).toBe(true);
    const colorLength = 2;
    expect(savedProduct.colors.length).toBe(colorLength);
    expect(savedProduct.colors[0]).toBe('Black');
    expect(savedProduct.colors[1]).toBe('White');
    expect(savedProduct.group.name).toBe('Product Group');

  });

  it('Should not get a product with an invalid token', async() => {

    const reOrderLevelValue = 100;
    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: reOrderLevelValue,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).get(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer2 ${clientToken}`);
    expect(response2.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not get a product with an empty token', async() => {

    const reOrderLevelValue = 100;
    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: reOrderLevelValue,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).get(`${InventoryUris.PRODUCT_URI}/${response.body._id}`);
    expect(response2.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not get product with invalid id', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product One',
      });
    expect(response.status).toBe(HTTP_OK);
    await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const response2 = await request(app).get(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not get product with junk id', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product One',
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).get(`${InventoryUris.PRODUCT_URI}/09u7y6`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should list all products', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product One',
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product Two',
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).get(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response3.status).toBe(HTTP_OK);

    const listedProducts: ProductEntity[] = response3.body;
    const colorLength = 2;
    expect(listedProducts.length).toBe(colorLength);
    expect(listedProducts[0].name).toBe('Product One');
    expect(listedProducts[1].name).toBe('Product Two');

  });

  it('Should not list products with an invalid token', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product One',
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product Two',
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).get(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer2 ${clientToken}`);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not list products with an empty token', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product One',
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product Two',
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).get(InventoryUris.PRODUCT_URI);
    expect(response3.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should update a product with valid values', async() => {

    const reOrderLevelValue = 100;
    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
        code: 'Code OneP',
        shortName: 'POP',
        brand: 'FBOP',
        location: 'Rack 1P',
        barcode: '876543218',
        unit: 'NumberP',
        reorderLevel: 1000,
        colors: [ 'BlackP', 'WhiteP' ],
        hasBatch: false,
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: reOrderLevelValue,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).get(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const savedProduct: ProductEntity = response3.body;
    expect(savedProduct.name).toBe('Product One');
    expect(savedProduct.code).toBe('Code One');
    expect(savedProduct.shortName).toBe('PO');
    expect(savedProduct.brand).toBe('FBO');
    expect(savedProduct.location).toBe('Rack 1');
    expect(savedProduct.barcode).toBe('87654321');
    expect(savedProduct.unit).toBe('Number');
    expect(savedProduct.reorderLevel).toBe(reOrderLevelValue);
    expect(savedProduct.hasBatch).toBe(true);
    const colorLength = 2;
    expect(savedProduct.colors.length).toBe(colorLength);
    expect(savedProduct.colors[0]).toBe('Black');
    expect(savedProduct.colors[1]).toBe('White');
    expect(savedProduct.group.name).toBe('Product Group');

  });

  it('Should not update a product an invalid token', async() => {

    const reOrderLevelValue = 100;
    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
        code: 'Code OneP',
        shortName: 'POP',
        brand: 'FBOP',
        location: 'Rack 1P',
        barcode: '876543218',
        unit: 'NumberP',
        reorderLevel: 1000,
        colors: [ 'BlackP', 'WhiteP' ],
        hasBatch: false,
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer2 ${clientToken}`)
      .send({
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: reOrderLevelValue,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response2.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not update a product an empty token', async() => {

    const reOrderLevelValue = 100;
    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
        code: 'Code OneP',
        shortName: 'POP',
        brand: 'FBOP',
        location: 'Rack 1P',
        barcode: '876543218',
        unit: 'NumberP',
        reorderLevel: 1000,
        colors: [ 'BlackP', 'WhiteP' ],
        hasBatch: false,
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .send({
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
        brand: 'FBO',
        location: 'Rack 1',
        barcode: '87654321',
        unit: 'Number',
        reorderLevel: reOrderLevelValue,
        colors: [ 'Black', 'White' ],
        hasBatch: true,
      });
    expect(response2.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should update a product after trim', async() => {

    const reOrderLevelValue = 100;
    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
        code: 'Code OneP',
        shortName: 'POP',
        brand: 'FBOP',
        location: 'Rack 1P',
        barcode: '876543218',
        unit: 'NumberP',
        reorderLevel: 1000,
        colors: [ 'BlackP', 'WhiteP' ],
        hasBatch: false,
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: ' Product One ',
        code: ' Code One ',
        shortName: ' PO ',
        brand: ' FBO ',
        location: ' Rack 1 ',
        barcode: ' 87654321 ',
        unit: ' Number ',
        reorderLevel: reOrderLevelValue,
        colors: [ ' Black ', ' White ' ],
        hasBatch: true,
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).get(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const savedProduct: ProductEntity = response3.body;
    expect(savedProduct.name).toBe('Product One');
    expect(savedProduct.code).toBe('Code One');
    expect(savedProduct.shortName).toBe('PO');
    expect(savedProduct.brand).toBe('FBO');
    expect(savedProduct.location).toBe('Rack 1');
    expect(savedProduct.barcode).toBe('87654321');
    expect(savedProduct.unit).toBe('Number');
    expect(savedProduct.reorderLevel).toBe(reOrderLevelValue);
    expect(savedProduct.hasBatch).toBe(true);
    const colorLength = 2;
    expect(savedProduct.colors.length).toBe(colorLength);
    expect(savedProduct.colors[0]).toBe('Black');
    expect(savedProduct.colors[1]).toBe('White');
    expect(savedProduct.group.name).toBe('Product Group');

  });

  it('Should not update a product with invalid id', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update a product with junk id', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/0oki98`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update a product with invalid group', async() => {

    expect(productGroup).toHaveProperty('_id');
    const tempProductGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(tempProductGroupRes.status).toBe(HTTP_OK);

    const tempProductGroup: ProductGroup = tempProductGroupRes.body;

    const response5 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        shortName: 'Group Short',
        name: 'Group One',
      });
    expect(response5.status).toBe(HTTP_OK);
    const response6 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${response5.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroup2: ProductGroup = response6.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroup2,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response3 = await request(app)['delete'](`${InventoryUris.PRODUCT_GROUP_URI}/${tempProductGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response3.status).toBe(HTTP_OK);

    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: tempProductGroup,
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update a product without name', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: null,
        code: 'Code One',
        shortName: 'PO',
      });

    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update a product with an invalid productGroup', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const deletedResponse = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(deletedResponse.status).toBe(HTTP_OK);

    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: deletedResponse.body,
        name: 'ProductGroup',
        code: 'Code One',
        shortName: 'PO',
      });

    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update a product with empty name', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: '',
        code: 'Code One',
        shortName: 'PO',
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should delete a product with valid id', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).get(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not delete a product with an invalid id', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).get(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not delete a product with invalid id', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not delete a product with invalid id', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not delete a product with junk id', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response3 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/0oik89`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not delete a group after delete the product', async() => {

    expect(productGroup).toHaveProperty('_id');
    const productGroupRes = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroupEntity: ProductGroup = productGroupRes.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroupEntity,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroupEntity._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const productGroup2: ProductGroup = response3.body;
    expect(productGroup2.name).toBe('Product Group');
    expect(productGroup2.shortName).toBe('PG');

  });

});
