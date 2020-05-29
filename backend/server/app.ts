import * as dotenv from 'dotenv';
import * as express from 'express';
import * as path from 'path';

// Put dotenv in use before importing controllers
dotenv.config();

// Import controllers
import usersController from './auth/user/user.controller';
import productController from './inventory/product/product.controller';
import taxController from './inventory/tax/tax.controller';
import productGroupController from './inventory/productGroup/productGroup.controller';
import brandController from './inventory/brand/brand.controller';
import locationController from './inventory/location/location.controller';
import unitController from './inventory/unit/unit.controller';
import colorController from './inventory/color/color.controller';
import partyController from './inventory/party/party.controller';
import purchaseController from './inventory/purchase/purchase.controller';
import { InventoryUris, AuthUris } from 'fivebyone';
// Create the express application
const app = express();

// Assign controllers to routes
app.use(AuthUris.USER_URI, usersController);
app.use(InventoryUris.PRODUCT_URI, productController);
app.use(InventoryUris.TAX_URI, taxController);
app.use(InventoryUris.PRODUCT_GROUP_URI, productGroupController);
app.use(InventoryUris.BRAND_URI, brandController);
app.use(InventoryUris.LOCATION_URI, locationController);
app.use(InventoryUris.UNIT_URI, unitController);
app.use(InventoryUris.COLOR_URI, colorController);
app.use(InventoryUris.PARTY_URI, partyController);
app.use(InventoryUris.PURCHASE_URI, purchaseController);

// Declare the path to frontend's static assets
app.use(express['static'](path.resolve('..', 'frontend', 'build')));

// Intercept requests to return the frontend's static entry point
app.get('*', (unknownVariable, response) => {

  response.sendFile(path.resolve('..', 'frontend', 'build', 'index.html'));

});

export default app;
