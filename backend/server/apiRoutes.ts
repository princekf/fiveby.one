import {Application} from 'express';
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
import permissionController from './auth/permission/permission.controller';
import companyController from './auth/company/company.controller';
import companyBranchController from './auth/companyBranch/companyBranch.controller';
import adminContoller from './auth/admin/admin.controller';

export class Routes {

  public static routes(app: Application): void {

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
    app.use(AuthUris.PERMISSION_URI, permissionController);
    app.use(AuthUris.COMPANY_URI, companyController);
    app.use(AuthUris.COMPANY_BRANCH_URI, companyBranchController);
    app.use(AuthUris.ADMIN_URI, adminContoller);

  }

}
