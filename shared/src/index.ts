import {Constants} from './Constants';
export {Constants};
import {InventoryUris} from './InventoryUris';
export {InventoryUris};
import {AuthUris} from './AuthUris';
export {AuthUris};
import {TaxS, Tax} from './entity/inventory/Tax';
export {TaxS, Tax};
import {ProductS, Product} from './entity/inventory/Product';
export {Product, ProductS};
import {ProductGroupS, ProductGroup} from './entity/inventory/ProductGroup';
export {ProductGroupS, ProductGroup};
import { Unit, UnitS } from './entity/inventory/Unit';
export { Unit, UnitS };
import {Party, PartyS} from './entity/inventory/Party';
export {Party, PartyS};
import {Purchase, PurchaseS} from './entity/inventory/Purchase';
export {Purchase, PurchaseS};
import {ProductSale, ProductSaleS} from './entity/inventory/ProductSale';
export {ProductSale, ProductSaleS};
import {User, UserS} from './entity/auth/User';
export {User, UserS};
import {Permission, PermissionS} from './entity/auth/Permission';
export {Permission, PermissionS};
import {Company, CompanyS} from './entity/auth/Company';
export {Company, CompanyS};

export const Greeter = (name: string) => {

  return `Hello ${name}`;

};

export const Greeter2 = (name: string) => {

  return `2 Hello ${name}`;

};
