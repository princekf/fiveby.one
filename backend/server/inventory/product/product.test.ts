/* eslint {max-lines-per-function: 0, max-statements:0, max-lines:0} */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import User from '../../auth/user/user.model';
import ProductGroup from '../productGroup/productGroup.model';
import Product from './product.model';
import Company from '../../auth/company/company.model';
import {Constants, Product as ProductEntity, ProductGroup as ProductGroupEntity, InventoryUris, AuthUris, CompanyS as CompanyI} from 'fivebyone';

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
describe(`${InventoryUris.PRODUCT_URI} tests`, () => {

  const mongod = new MMS.MongoMemoryServer();
  let serverToken = '';
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

  beforeEach(async() => {

    await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product Group',
        shortName: 'PG',
      });

  });

  // Remove sample items
  afterEach(async() => {

    await Product.remove({});
    await ProductGroup.remove({});

  });

  it('Should save product with valid values', async() => {

    const reOrderLevelValue = 100;
    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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
      .set('Authorization', `Bearer ${serverToken}`);
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


  it('Should save product after trimming', async() => {

    const reOrderLevelValue = 100;
    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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
      .set('Authorization', `Bearer ${serverToken}`);
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

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    await request(app)['delete'](`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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
      .set('Authorization', `Bearer ${serverToken}`)
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

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response2 = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response2 = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Name One',
      });
    expect(response2.status).toBe(HTTP_OK);

  });

  it('Should get a product with valid id', async() => {

    const reOrderLevelValue = 100;
    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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
      .set('Authorization', `Bearer ${serverToken}`);
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

  it('Should not get product with invalid id', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product One',
      });
    expect(response.status).toBe(HTTP_OK);
    await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const response2 = await request(app).get(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });


  it('Should not get product with junk id', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product One',
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).get(`${InventoryUris.PRODUCT_URI}/09u7y6`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should list all products', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product One',
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product Two',
      });
    expect(response2.status).toBe(HTTP_OK);

    const response3 = await request(app).get(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);

    const listedProducts: ProductEntity[] = response3.body;
    const colorLength = 2;
    expect(listedProducts.length).toBe(colorLength);
    expect(listedProducts[0].name).toBe('Product One');
    expect(listedProducts[1].name).toBe('Product Two');

  });

  it('Should update a product with valid values', async() => {

    const reOrderLevelValue = 100;
    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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
      .set('Authorization', `Bearer ${serverToken}`)
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
      .set('Authorization', `Bearer ${serverToken}`);
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


  it('Should update a product after trim', async() => {

    const reOrderLevelValue = 100;
    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
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
      .set('Authorization', `Bearer ${serverToken}`)
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
      .set('Authorization', `Bearer ${serverToken}`);
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

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });


  it('Should not update a product with junk id', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/0oki98`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update a product with invalid group', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response5 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        shortName: 'Group Short',
        name: 'Group One',
      });
    expect(response5.status).toBe(HTTP_OK);
    const response6 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${response5.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    const productGroup2: ProductGroupEntity = response6.body;

    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup2,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response3 = await request(app)['delete'](`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);

    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product One',
        code: 'Code One',
        shortName: 'PO',
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update a product without name', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: null,
        code: 'Code One',
        shortName: 'PO',
      });

    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not update a product with empty name', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app).put(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: '',
        code: 'Code One',
        shortName: 'PO',
      });
    expect(response2.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should delete a product with valid id', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).get(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not delete a product with invalid id', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not delete a product with junk id', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response3 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/0oik89`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Should not delete a group after delete the product', async() => {

    const productGroup: ProductGroupEntity = await ProductGroup.findOne({name: 'Product Group'});
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${serverToken}`)
      .send({
        group: productGroup,
        name: 'Product OneP',
      });
    expect(response.status).toBe(HTTP_OK);
    const response2 = await request(app)['delete'](`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const response3 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${productGroup._id}`)
      .set('Authorization', `Bearer ${serverToken}`);
    expect(response3.status).toBe(HTTP_OK);
    const productGroup2: ProductGroupEntity = response3.body;
    expect(productGroup2.name).toBe('Product Group');
    expect(productGroup2.shortName).toBe('PG');

  });

});
