/* eslint max-lines-per-function: 0, max-lines: 0, max-statements: 0 */
import * as MMS from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import app from '../../app';
import { UserModel } from '../../auth/user/user.model';
import { AdminUserModel } from '../../auth/admin/admin.model';
import { PurchaseModel } from './purchase.model';
import { PartyModel } from '../party/party.model';
import { ProductModel } from '../product/product.model';
import { ProductGroupModel } from '../productGroup/productGroup.model';
import { UnitModel } from '../unit/unit.model';
import { TaxModel } from '../tax/tax.model';
import {
  Constants, Purchase as PurchaseEntity,
  InventoryUris, Party as PartyEntity,
  Product as ProductEntity,
  ProductGroup as ProductGroupEntity,
  Unit as UnitEntity,
  Tax as TaxEntity,
  AuthUris, Company
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


  const getPartyEntity = async(): Promise<PartyEntity> => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: true,
        addresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const party: PartyEntity = response1.body;
    return party;

  };

  const getOnlyCustomerPartyEntity = async(): Promise<PartyEntity> => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: false,
        addresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    const response1 = await request(app).get(`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const party: PartyEntity = response1.body;
    return party;

  };
  const getProductEntity1 = async(): Promise<ProductEntity> => {

    const response3 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Product Group Name 2',
        shortName: 'Short Name 2',
      });
    const response4 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${response3.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroup: ProductGroupEntity = response4.body;
    const reOrderLevelValue = 100;
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
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
        hasBatch: false,
      });
    const response2 = await request(app).get(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const product: ProductEntity = response2.body;
    return product;

  };

  const getProductEntity2 = async(): Promise<ProductEntity> => {

    const response3 = await request(app).post(InventoryUris.PRODUCT_GROUP_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Product Group Name 3',
        shortName: 'Short Name 3',
      });
    const response4 = await request(app).get(`${InventoryUris.PRODUCT_GROUP_URI}/${response3.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const productGroup: ProductGroupEntity = response4.body;
    const reOrderLevelValue = 100;
    const response = await request(app).post(InventoryUris.PRODUCT_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        group: productGroup,
        name: 'Product Two',
        code: 'Code Two',
        shortName: 'PT',
        brand: 'FBT',
        location: 'Rack 2',
        barcode: '87654322',
        unit: 'Number',
        reorderLevel: reOrderLevelValue,
        colors: [ 'Blue', 'Green' ],
        hasBatch: true,
      });
    const response2 = await request(app).get(`${InventoryUris.PRODUCT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const product: ProductEntity = response2.body;
    return product;

  };
  const getUnitEntity = async(): Promise<UnitEntity> => {

    const kilogramDecimalPlaces = 3;
    const response = await request(app).post(`${InventoryUris.UNIT_URI}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'Kilogram',
        shortName: 'kg',
        decimalPlaces: kilogramDecimalPlaces,
      });
    const response2 = await request(app).get(`${InventoryUris.UNIT_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const unit: UnitEntity = response2.body;
    return unit;

  };
  const getTaxEntitySGST = async(): Promise<TaxEntity> => {

    const tPercentage = 9;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'SGST-9',
        groupName: 'SGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2030-12-31',
          percentage: tPercentage
        } ]
      });
    const response1 = await request(app).get(`${InventoryUris.TAX_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const tax: TaxEntity = response1.body;
    return tax;

  };
  const getTaxEntityCGST = async(): Promise<TaxEntity> => {

    const tPercentage = 9;
    const response = await request(app).post(InventoryUris.TAX_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'CGST-9',
        groupName: 'CGST',
        effectiveFrom: [ {
          startDate: '2018-01-01',
          endDate: '2030-12-31',
          percentage: tPercentage
        } ]
      });
    const response1 = await request(app).get(`${InventoryUris.TAX_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    const tax: TaxEntity = response1.body;
    return tax;

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
    const PurchaseMod = PurchaseModel.createModel(company.code);
    await PurchaseMod.deleteMany({});
    const ProductGroupMod = ProductGroupModel.createModel(company.code);
    await ProductGroupMod.deleteMany({});
    const ProductMod = ProductModel.createModel(company.code);
    await ProductMod.deleteMany({});
    const PartyMod = PartyModel.createModel(company.code);
    await PartyMod.deleteMany({});
    const UnitMod = UnitModel.createModel(company.code);
    await UnitMod.deleteMany({});
    const TaxMod = TaxModel.createModel(company.code);
    await TaxMod.deleteMany({});

  });

  it('Should save purchase with valid values.', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 50.10;
    const totalAmount = 950.10;
    const mrp = 1500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            totalTax,
            taxes: [ sgst._id, cgst._id ],
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).get(`${InventoryUris.PURCHASE_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const purchase: PurchaseEntity = response2.body;
    expect(purchase.purchaseDate).toBe('2020-04-01');
    expect(purchase.invoiceNumber).toBe('AB0091');
    expect(purchase.invoiceDate).toBe('2020-04-01');
    expect(purchase.orderNumber).toBe('ORD-0981');
    expect(purchase.orderDate).toBe('2020-04-01');
    expect(purchase.party.name).toBe(party.name);
    expect(purchase.totalAmount).toBe(pTotalAmount);
    expect(purchase.totalDiscount).toBe(pTotalDiscount);
    expect(purchase.totalTax).toBe(pTotalTax);
    expect(purchase.roundOff).toBe(pRoundOff);
    expect(purchase.grandTotal).toBe(pGrandTotal);
    expect(purchase.narration).toBe('Test Purchase');
    expect(purchase.purchaseItems.length).toBe(1);
    const [ pItem ] = purchase.purchaseItems;
    expect(pItem.product.name).toBe(product.name);
    expect(pItem.unitPrice).toBe(unitPrice);
    expect(pItem.quantity).toBe(quantity);
    expect(pItem.discount).toBe(discount);
    expect(pItem.totalAmount).toBe(totalAmount);
    expect(pItem.mrp).toBe(mrp);
    expect(pItem.expirtyDate).toBe('2022-03-21');
    expect(pItem.mfgDate).toBe('2020-03-21');
    expect(pItem.batchNumber).toBe('BN-001');
    expect(pItem.unit.name).toBe(unit.name);
    expect(pItem.totalTax).toBe(totalTax);
    const taxLength = 2;
    expect(pItem.taxes.length).toBe(taxLength);
    expect(pItem.taxes[0].name).toBe(sgst.name);
    expect(pItem.taxes[0].effectiveFrom[0].percentage).toBe(sgst.effectiveFrom[0].percentage);
    expect(pItem.taxes[1].name).toBe(cgst.name);
    expect(pItem.taxes[1].effectiveFrom[0].percentage).toBe(cgst.effectiveFrom[0].percentage);

  });

  it('Should not fetch a purchase with an invalid token.', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 50.10;
    const totalAmount = 950.10;
    const mrp = 1500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            totalTax,
            taxes: [ sgst._id, cgst._id ],
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).get(`${InventoryUris.PURCHASE_URI}/${response.body._id}`)
      .set('Authorization', `Bearer2 ${clientToken}`);
    expect(response2.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not fetch a purchase with an empty token.', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 50.10;
    const totalAmount = 950.10;
    const mrp = 1500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            totalTax,
            taxes: [ sgst._id, cgst._id ],
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).get(`${InventoryUris.PURCHASE_URI}/${response.body._id}`);
    expect(response2.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should save purchase with valid values.', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 50.10;
    const totalAmount = 950.10;
    const mrp = 1500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            totalTax,
            taxes: [ sgst._id, cgst._id ],
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).get(`${InventoryUris.PURCHASE_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const purchase: PurchaseEntity = response2.body;
    expect(purchase.purchaseDate).toBe('2020-04-01');
    expect(purchase.invoiceNumber).toBe('AB0091');
    expect(purchase.invoiceDate).toBe('2020-04-01');
    expect(purchase.orderNumber).toBe('ORD-0981');
    expect(purchase.orderDate).toBe('2020-04-01');
    expect(purchase.party.name).toBe(party.name);
    expect(purchase.totalAmount).toBe(pTotalAmount);
    expect(purchase.totalDiscount).toBe(pTotalDiscount);
    expect(purchase.totalTax).toBe(pTotalTax);
    expect(purchase.roundOff).toBe(pRoundOff);
    expect(purchase.grandTotal).toBe(pGrandTotal);
    expect(purchase.narration).toBe('Test Purchase');
    expect(purchase.purchaseItems.length).toBe(1);
    const [ pItem ] = purchase.purchaseItems;
    expect(pItem.product.name).toBe(product.name);
    expect(pItem.unitPrice).toBe(unitPrice);
    expect(pItem.quantity).toBe(quantity);
    expect(pItem.discount).toBe(discount);
    expect(pItem.totalAmount).toBe(totalAmount);
    expect(pItem.mrp).toBe(mrp);
    expect(pItem.expirtyDate).toBe('2022-03-21');
    expect(pItem.mfgDate).toBe('2020-03-21');
    expect(pItem.batchNumber).toBe('BN-001');
    expect(pItem.unit.name).toBe(unit.name);
    expect(pItem.totalTax).toBe(totalTax);
    const taxLength = 2;
    expect(pItem.taxes.length).toBe(taxLength);
    expect(pItem.taxes[0].name).toBe(sgst.name);
    expect(pItem.taxes[0].effectiveFrom[0].percentage).toBe(sgst.effectiveFrom[0].percentage);
    expect(pItem.taxes[1].name).toBe(cgst.name);
    expect(pItem.taxes[1].effectiveFrom[0].percentage).toBe(cgst.effectiveFrom[0].percentage);

  });

  it('Should not save purchase with an invalid token.', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 50.10;
    const totalAmount = 950.10;
    const mrp = 1500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer2 ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            totalTax,
            taxes: [ sgst._id, cgst._id ],
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should not save purchase with an empty token.', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 50.10;
    const totalAmount = 950.10;
    const mrp = 1500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            totalTax,
            taxes: [ sgst._id, cgst._id ],
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_UNAUTHORIZED);

  });

  it('Should save purchase with minimum values.', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();

    const pTotalAmount = 1000;
    const pGrandTotal = 1000;

    const unitPrice = 500;
    const quantity = 2;
    const totalAmount = 1000;
    const mrp = 1500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: '',
        totalTax: '',
        roundOff: '',
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount: '',
            totalTax: '',
            taxes: [],
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).get(`${InventoryUris.PURCHASE_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const purchase: PurchaseEntity = response2.body;
    expect(purchase.purchaseDate).toBe('2020-04-01');
    expect(purchase.invoiceNumber).toBe('AB0091');
    expect(purchase.invoiceDate).toBe('2020-04-01');
    expect(purchase.orderNumber).toBe('ORD-0981');
    expect(purchase.orderDate).toBe('2020-04-01');
    expect(purchase.party.name).toBe(party.name);
    expect(purchase.totalAmount).toBe(pTotalAmount);
    expect(!purchase.totalDiscount).toBe(true);
    expect(!purchase.totalTax).toBe(true);
    expect(!purchase.roundOff).toBe(true);
    expect(purchase.grandTotal).toBe(pGrandTotal);
    expect(purchase.narration).toBe('Test Purchase');
    expect(purchase.purchaseItems.length).toBe(1);
    const [ pItem ] = purchase.purchaseItems;
    expect(pItem.product.name).toBe(product.name);
    expect(pItem.unitPrice).toBe(unitPrice);
    expect(pItem.quantity).toBe(quantity);
    expect(!pItem.discount).toBe(true);
    expect(pItem.totalAmount).toBe(totalAmount);
    expect(pItem.mrp).toBe(mrp);
    expect(pItem.expirtyDate).toBe('2022-03-21');
    expect(pItem.mfgDate).toBe('2020-03-21');
    expect(pItem.batchNumber).toBe('BN-001');
    expect(pItem.unit.name).toBe(unit.name);
    expect(!pItem.totalTax).toBe(true);
    expect(pItem.taxes.length).toBe(0);

  });

  it('Should save purchase with 2 different products', async() => {

    const party = await getPartyEntity();
    const product1 = await getProductEntity1();
    const product2 = await getProductEntity2();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 2200;
    const pTotalDiscount = 300;
    const pTotalTax = 300.90;
    const pRoundOff = 0.10;
    const pGrandTotal = 2201;

    const unitPrice1 = 500;
    const quantity1 = 2;
    const discount1 = 100;
    const totalTax1 = 100.40;
    const totalAmount1 = 1000.40;
    const mrp1 = 600;

    const unitPrice2 = 400;
    const quantity2 = 3;
    const discount2 = 200;
    const totalTax2 = 200.50;
    const totalAmount2 = 1200.50;
    const mrp2 = 500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice: unitPrice1,
            quantity: quantity1,
            unit: unit._id,
            discount: discount1,
            taxes: [ sgst._id, cgst._id ],
            totalTax: totalTax1,
            totalAmount: totalAmount1,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp: mrp1,
          },
          {
            product: product2._id,
            unitPrice: unitPrice2,
            quantity: quantity2,
            unit: unit._id,
            discount: discount2,
            taxes: [ sgst._id ],
            totalTax: totalTax2,
            totalAmount: totalAmount2,
            batchNumber: 'BN-002',
            expirtyDate: '2022-03-22',
            mfgDate: '2020-03-22',
            mrp: mrp2,
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).get(`${InventoryUris.PURCHASE_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const purchase: PurchaseEntity = response2.body;
    expect(purchase.purchaseDate).toBe('2020-04-01');
    expect(purchase.invoiceNumber).toBe('AB0091');
    expect(purchase.invoiceDate).toBe('2020-04-01');
    expect(purchase.orderNumber).toBe('ORD-0981');
    expect(purchase.orderDate).toBe('2020-04-01');
    expect(purchase.party.name).toBe(party.name);
    expect(purchase.totalAmount).toBe(pTotalAmount);
    expect(purchase.totalDiscount).toBe(pTotalDiscount);
    expect(purchase.totalTax).toBe(pTotalTax);
    expect(purchase.roundOff).toBe(pRoundOff);
    expect(purchase.grandTotal).toBe(pGrandTotal);
    expect(purchase.narration).toBe('Test Purchase');
    const purchaseItemsLength = 2;
    expect(purchase.purchaseItems.length).toBe(purchaseItemsLength);

    const [ pItem1, pItem2 ] = purchase.purchaseItems;
    expect(pItem1.product.name).toBe(product1.name);
    expect(pItem1.unitPrice).toBe(unitPrice1);
    expect(pItem1.quantity).toBe(quantity1);
    expect(pItem1.discount).toBe(discount1);
    expect(pItem1.totalAmount).toBe(totalAmount1);
    expect(pItem1.mrp).toBe(mrp1);
    expect(pItem1.expirtyDate).toBe('2022-03-21');
    expect(pItem1.mfgDate).toBe('2020-03-21');
    expect(pItem1.batchNumber).toBe('BN-001');
    expect(pItem1.unit.name).toBe(unit.name);
    const taxLength = 2;
    expect(pItem1.taxes.length).toBe(taxLength);
    expect(pItem1.totalTax).toBe(totalTax1);
    expect(pItem1.taxes[0].name).toBe(sgst.name);
    expect(pItem1.taxes[0].effectiveFrom[0].percentage).toBe(sgst.effectiveFrom[0].percentage);
    expect(pItem1.taxes[1].name).toBe(cgst.name);
    expect(pItem1.taxes[1].effectiveFrom[0].percentage).toBe(cgst.effectiveFrom[0].percentage);

    expect(pItem2.product.name).toBe(product2.name);
    expect(pItem2.unitPrice).toBe(unitPrice2);
    expect(pItem2.quantity).toBe(quantity2);
    expect(pItem2.discount).toBe(discount2);
    expect(pItem2.totalAmount).toBe(totalAmount2);
    expect(pItem2.mrp).toBe(mrp2);
    expect(pItem2.expirtyDate).toBe('2022-03-22');
    expect(pItem2.mfgDate).toBe('2020-03-22');
    expect(pItem2.batchNumber).toBe('BN-002');
    expect(pItem2.unit.name).toBe(unit.name);
    expect(pItem2.totalTax).toBe(totalTax2);
    expect(pItem2.taxes.length).toBe(1);
    expect(pItem2.taxes[0].name).toBe(sgst.name);
    expect(pItem2.taxes[0].effectiveFrom[0].percentage).toBe(sgst.effectiveFrom[0].percentage);

  });

  it('Purchase date is mandatory', async() => {

    const party = await getPartyEntity();
    const product1 = await getProductEntity1();
    const product2 = await getProductEntity2();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response0 = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          },
          {
            product: product2._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id ],
            totalAmount,
            batchNumber: 'BN-002',
            expirtyDate: '2022-03-22',
            mfgDate: '2020-03-22',
            mrp,
          }
        ]
      });
    expect(response0.status).toBe(HTTP_BAD_REQUEST);
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          },
          {
            product: product2._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id ],
            totalAmount,
            batchNumber: 'BN-002',
            expirtyDate: '2022-03-22',
            mfgDate: '2020-03-22',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Invoice date should not be after purchase date', async() => {

    const party = await getPartyEntity();
    const product1 = await getProductEntity1();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Order date should not be after purchase date', async() => {

    const party = await getPartyEntity();
    const product1 = await getProductEntity1();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Party is mandatory', async() => {

    const product1 = await getProductEntity1();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Party type should be vendor', async() => {

    const party = await getOnlyCustomerPartyEntity();
    const product1 = await getProductEntity1();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Validate GrandTotal calculation', async() => {

    const party = await getPartyEntity();
    const product1 = await getProductEntity1();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 940;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Grand total should not be less than 0', async() => {

    const party = await getPartyEntity();
    const product1 = await getProductEntity1();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 1000;
    const pTotalTax = 0;
    const pRoundOff = -10;
    const pGrandTotal = -10;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Total discount should not be less than 0', async() => {

    const party = await getPartyEntity();
    const product1 = await getProductEntity1();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = -100;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 1200;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Total tax should not be less than 0', async() => {

    const party = await getPartyEntity();
    const product1 = await getProductEntity1();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = -100;
    const pRoundOff = 0;
    const pGrandTotal = 800;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Total amount should not be less than 0', async() => {


    const party = await getPartyEntity();
    const product1 = await getProductEntity1();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = -1000;
    const pTotalDiscount = 0;
    const pTotalTax = 1100;
    const pRoundOff = 0;
    const pGrandTotal = 100;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - product is mandatory', async() => {

    const party = await getPartyEntity();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 0;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 1100;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: '',
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - unit is mandatory', async() => {

    const party = await getPartyEntity();
    const product1 = await getProductEntity1();

    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 0;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 1100;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity,
            unit: ' ',
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - unit price is mandatory', async() => {

    const party = await getPartyEntity();
    const product1 = await getProductEntity1();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 0;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 1100;

    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice: '',
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    const response1 = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response1.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - quantity is mandatory', async() => {

    const party = await getPartyEntity();
    const product1 = await getProductEntity1();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 0;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 1100;

    const unitPrice = 500;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity: '',
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    const response1 = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response1.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - quantity should not be less than 0', async() => {

    const party = await getPartyEntity();
    const product1 = await getProductEntity1();

    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 0;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 1100;

    const unitPrice = 500;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;
    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-03-31',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-03-28',
        orderNumber: 'ORD-0981',
        orderDate: '2020-03-25',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product1._id,
            unitPrice,
            quantity: 0,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - should save with empty tax', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 0;
    const pRoundOff = 0.00;
    const pGrandTotal = 900;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 0;
    const totalAmount = 900.00;
    const mrp = 700;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).get(`${InventoryUris.PURCHASE_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const purchase: PurchaseEntity = response2.body;
    expect(purchase.purchaseDate).toBe('2020-04-01');
    expect(purchase.invoiceNumber).toBe('AB0091');
    expect(purchase.invoiceDate).toBe('2020-04-01');
    expect(purchase.orderNumber).toBe('ORD-0981');
    expect(purchase.orderDate).toBe('2020-04-01');
    expect(purchase.party.name).toBe(party.name);
    expect(purchase.totalAmount).toBe(pTotalAmount);
    expect(purchase.totalDiscount).toBe(pTotalDiscount);
    expect(purchase.totalTax).toBe(pTotalTax);
    expect(purchase.roundOff).toBe(pRoundOff);
    expect(purchase.grandTotal).toBe(pGrandTotal);
    expect(purchase.narration).toBe('Test Purchase');
    expect(purchase.purchaseItems.length).toBe(1);
    const [ pItem ] = purchase.purchaseItems;
    expect(pItem.product.name).toBe(product.name);
    expect(pItem.unitPrice).toBe(unitPrice);
    expect(pItem.quantity).toBe(quantity);
    expect(pItem.discount).toBe(discount);
    expect(pItem.totalAmount).toBe(totalAmount);
    expect(pItem.mrp).toBe(mrp);
    expect(pItem.expirtyDate).toBe('2022-03-21');
    expect(pItem.mfgDate).toBe('2020-03-21');
    expect(pItem.batchNumber).toBe('BN-001');
    expect(pItem.unit.name).toBe(unit.name);

  });

  it('Purchase item - should save without tax', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100.10;
    const pTotalTax = 0;
    const pRoundOff = 0.10;
    const pGrandTotal = 900;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100.10;
    const totalTax = 0;
    const totalAmount = 899.90;
    const mrp = 1500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);

    const response2 = await request(app).get(`${InventoryUris.PURCHASE_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response2.status).toBe(HTTP_OK);
    const purchase: PurchaseEntity = response2.body;
    expect(purchase.purchaseDate).toBe('2020-04-01');
    expect(purchase.invoiceNumber).toBe('AB0091');
    expect(purchase.invoiceDate).toBe('2020-04-01');
    expect(purchase.orderNumber).toBe('ORD-0981');
    expect(purchase.orderDate).toBe('2020-04-01');
    expect(purchase.party.name).toBe(party.name);
    expect(purchase.totalAmount).toBe(pTotalAmount);
    expect(purchase.totalDiscount).toBe(pTotalDiscount);
    expect(purchase.totalTax).toBe(pTotalTax);
    expect(purchase.roundOff).toBe(pRoundOff);
    expect(purchase.grandTotal).toBe(pGrandTotal);
    expect(purchase.narration).toBe('Test Purchase');
    expect(purchase.purchaseItems.length).toBe(1);
    const [ pItem ] = purchase.purchaseItems;
    expect(pItem.product.name).toBe(product.name);
    expect(pItem.unitPrice).toBe(unitPrice);
    expect(pItem.quantity).toBe(quantity);
    expect(pItem.discount).toBe(discount);
    expect(pItem.totalAmount).toBe(totalAmount);
    expect(pItem.mrp).toBe(mrp);
    expect(pItem.expirtyDate).toBe('2022-03-21');
    expect(pItem.mfgDate).toBe('2020-03-21');
    expect(pItem.batchNumber).toBe('BN-001');
    expect(pItem.unit.name).toBe(unit.name);

  });

  it('Purchase item - tax should be zero if no taxes are selected', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 100;
    const pRoundOff = 0.00;
    const pGrandTotal = 1000;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 100;
    const totalAmount = 1000.00;
    const mrp = 700;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - total amount is mandatory', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = '';
    const mrp = 1500;

    let response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

    response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - validate total amount calculation', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50.10;
    const pRoundOff = -0.10;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 200;
    const totalAmount = 900;
    const mrp = 1500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase - total of discount should match with purchase items.', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50;
    const pRoundOff = 0;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 50;
    const totalTax = 50;
    const totalAmount = 1000;
    const mrp = 1500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase - total of tax should match with purchase items.', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50;
    const pRoundOff = 0;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 100;
    const totalAmount = 1000;
    const mrp = 1500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase - total of amount should match with purchase items.', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 50;
    const pRoundOff = 0;
    const pGrandTotal = 950;

    const unitPrice = 500;
    const quantity = 3;
    const discount = 100;
    const totalTax = 50;
    const totalAmount = 1450;
    const mrp = 1500;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });
  it('Purchase item - total amount should not be less than 0', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const product2 = await getProductEntity2();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 700;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 400;

    const unitPrice = 500;
    const quantity = 1;
    const discount = 100;
    const totalTax = 50;
    const totalAmount = 450;
    const mrp = 1500;
    const discount2 = 600;
    const totalAmount2 = -50;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          },
          {
            product: product2._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount: discount2,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount: totalAmount2,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - unit price should not be less than 0', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const product2 = await getProductEntity2();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 400;
    const pTotalDiscount = 100;
    const pTotalTax = 50;
    const pRoundOff = 0;
    const pGrandTotal = 350;

    const unitPrice = 500;
    const quantity = 1;
    const discount = 100;
    const totalTax = 50;
    const totalAmount = 450;
    const mrp = 1500;
    const unitPrice2 = -100;
    const discount2 = 0;
    const totalAmount2 = -100;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          },
          {
            product: product2._id,
            unitPrice: unitPrice2,
            quantity,
            unit: unit._id,
            discount: discount2,
            taxes: [],
            totalTax: 0,
            totalAmount: totalAmount2,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - mrp is mandatory', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 1000;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 100;
    const totalAmount = 1000;

    let response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp: '',
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - mrp should not be less than 0', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 1000;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 100;
    const totalAmount = 1000;
    const mrp = -100;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2020-03-21',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - mfg date shoud not be after expiry date', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 1000;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 100;
    const totalAmount = 1000;
    const mrp = 1000;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-21',
            mfgDate: '2022-03-22',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('If hasBatch is true for product, then purchase item should have mfg date and expiry date.', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity2();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 1000;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 100;
    const totalAmount = 1000;
    const mrp = 1000;

    let response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '',
            mfgDate: '2020-03-22',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-22',
            mfgDate: '',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            mfgDate: '2020-03-22',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

    response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-22',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });

  it('Purchase item - mfg date should not be after purchase date', async() => {

    const party = await getPartyEntity();
    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 1000;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 100;
    const totalAmount = 1000;
    const mrp = 1000;

    const response = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: party._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-31',
            mfgDate: '2020-04-02',
            mrp,
          }
        ]
      });
    expect(response.status).toBe(HTTP_BAD_REQUEST);

  });


  it('Party should not update type from vendor to no vendor, if purchase is made', async() => {

    const response = await request(app).post(InventoryUris.PARTY_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        name: 'John Honai',
        code: 'JNHN',
        mobile: '+91123456789',
        email: 'john.honai@fiveby.one',
        isCustomer: true,
        isVendor: true,
        addresses: [
          {
            type: 'billing',
            addressLine1: '36-B, Orchid Villa',
            addressLine2: 'Harihar Nagar',
            addressLine3: 'Pathalam',
            addressLine4: 'Kochi',
            state: 'Kerala',
            country: 'India',
            pinCode: '682001',
            landMark: 'Behind EMS Library'
          }
        ],
        registrationNumbers: [
          {
            name: 'GST Number',
            value: 'AABBCCDDEEFF'
          }
        ]
      });
    expect(response.status).toBe(HTTP_OK);

    const product = await getProductEntity1();
    const unit = await getUnitEntity();
    const sgst = await getTaxEntitySGST();
    const cgst = await getTaxEntityCGST();

    const pTotalAmount = 1000;
    const pTotalDiscount = 100;
    const pTotalTax = 100;
    const pRoundOff = 0;
    const pGrandTotal = 1000;

    const unitPrice = 500;
    const quantity = 2;
    const discount = 100;
    const totalTax = 100;
    const totalAmount = 1000;
    const mrp = 1000;

    const response2 = await request(app).post(InventoryUris.PURCHASE_URI)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        purchaseDate: '2020-04-01',
        invoiceNumber: 'AB0091',
        invoiceDate: '2020-04-01',
        orderNumber: 'ORD-0981',
        orderDate: '2020-04-01',
        party: response.body._id,
        totalAmount: pTotalAmount,
        totalDiscount: pTotalDiscount,
        totalTax: pTotalTax,
        roundOff: pRoundOff,
        grandTotal: pGrandTotal,
        narration: 'Test Purchase',
        purchaseItems: [
          {
            product: product._id,
            unitPrice,
            quantity,
            unit: unit._id,
            discount,
            taxes: [ sgst._id, cgst._id ],
            totalTax,
            totalAmount,
            batchNumber: 'BN-001',
            expirtyDate: '2022-03-31',
            mfgDate: '2020-03-02',
            mrp,
          }
        ]
      });
    expect(response2.status).toBe(HTTP_OK);


    const response1 = await request(app).put(`${InventoryUris.PARTY_URI}/${response.body._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        isVendor: false,
      });
    expect(response1.status).toBe(HTTP_BAD_REQUEST);

  });

});
