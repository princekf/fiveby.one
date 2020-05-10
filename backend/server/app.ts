import * as dotenv from 'dotenv';
import * as express from 'express';
import * as path from 'path';

// Put dotenv in use before importing controllers
dotenv.config();

// Import controllers
import itemsController from './items/items.controller';
import usersController from './users/users.controller';
import productController from './inventory/product/product.controller';
import taxController from './inventory/tax/tax.controller';
import productGroupController from './inventory/productGroup/productgroup.controller';
import brandController from './inventory/brand/brand.controller';
import locationController from './inventory/location/location.controller';
import unitController from './inventory/unit/unit.controller';
import colorController from './inventory/color/color.controller';
// Create the express application
const app = express();

// Assign controllers to routes
app.use('/api/items', itemsController);
app.use('/api/users', usersController);
app.use('/api/inventory/product', productController);
app.use('/api/inventory/tax', taxController);
app.use('/api/inventory/productgroup', productGroupController);
app.use('/api/inventory/brand', brandController);
app.use('/api/inventory/location', locationController);
app.use('/api/inventory/unit', unitController);
app.use('/api/inventory/color', colorController);

// Declare the path to frontend's static assets
app.use(express['static'](path.resolve('..', 'frontend', 'build')));

// Intercept requests to return the frontend's static entry point
app.get('*', (unknownVariable, response) => {

  response.sendFile(path.resolve('..', 'frontend', 'build', 'index.html'));

});

export default app;
