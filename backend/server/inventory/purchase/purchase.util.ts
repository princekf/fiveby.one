import moment = require('moment');
import { Constants, Purchase as PurchaseEntity } from 'fivebyone';
import Party from '../party/party.model';
import Product from '../product/product.model';

export class PurchaseUtil {

  private static validatePrimaryValues = async(purchase: PurchaseEntity): Promise<void> => {

    const purchaseM = moment(purchase.purchaseDate, Constants.DATE_FORMAT);
    const invoiceM = moment(purchase.invoiceDate, Constants.DATE_FORMAT);
    if (invoiceM.isAfter(purchaseM)) {

      throw new Error('Invoice date is after purchase date.');

    }
    const orderM = moment(purchase.orderDate, Constants.DATE_FORMAT);
    if (orderM.isAfter(purchaseM)) {

      throw new Error('Order date is after purchase date.');

    }
    if (orderM.isAfter(invoiceM)) {

      throw new Error('Order date is after invoice date.');

    }
    const party = await Party.findById(purchase.party);
    if (!party.isVendor) {

      throw new Error('party is not a vendor.');

    }

    if (purchase.grandTotal < 0) {

      throw new Error('Grand total cannot be less than zero.');

    }

    if (purchase.totalDiscount < 0) {

      throw new Error('Total discount cannot be less than zero.');

    }
    if (purchase.totalTax < 0) {

      throw new Error('Total tax cannot be less than zero.');

    }
    if (purchase.totalAmount < 0) {

      throw new Error('Total amount cannot be less than zero.');

    }

  };

  private static validatePurchaseItemValuesDates = (pItemObj: any, purchase: PurchaseEntity) => {

    const mfgDateM = moment(pItemObj.mfgDate, Constants.DATE_FORMAT);
    if (pItemObj.mfgDate && pItemObj.expirtyDate) {

      if (mfgDateM.isAfter(moment(pItemObj.expirtyDate, Constants.DATE_FORMAT))) {

        throw new Error('MFG date is after expirty date.');

      }

    }
    const purchaseDateM = moment(purchase.purchaseDate, Constants.DATE_FORMAT);

    if (pItemObj.expirtyDate) {

      if (purchaseDateM.isAfter(moment(pItemObj.expirtyDate, Constants.DATE_FORMAT))) {

        throw new Error('Purchase date should not be after expiry date.');

      }

    }
    if (pItemObj.mfgDate) {

      if (mfgDateM.isAfter(purchaseDateM)) {

        throw new Error('MFG date should not be after purchase date.');

      }

    }

  };

  private static validatePurchaseItemValues2 = async(pItemObj: any) => {

    const product = await Product.findById(pItemObj.product);
    if (product.hasBatch) {

      if (!pItemObj.mfgDate || !pItemObj.expirtyDate) {

        throw new Error('MFG date and expiry dates are required when hasBatch is true for product.');

      }

    }

    if (!pItemObj.taxes || pItemObj.taxes.length === 0) {

      if (pItemObj.totalTax && pItemObj.totalTax !== 0) {

        throw new Error('Tax should be 0, if tax list of purchase item is empty.');

      }

    }

  };

  private static validatePurchaseItemValues = (pItemObj: any) => {


    if (pItemObj.quantity <= 0) {

      throw new Error('Quantitiy should be greater than 0.');

    }
    if (pItemObj.unitPrice < 0) {

      throw new Error('Unit price cannot be less than 0.');

    }
    if (pItemObj.totalAmount < 0) {

      throw new Error('Total amount cannot be less than 0.');

    }
    if (pItemObj.mrp < 0) {

      throw new Error('MRP cannot be less than 0.');

    }


  };

  private static validatePurchaseVsItems = (purchase: PurchaseEntity, calcuatedValueFromPItem: any) => {

    if (!purchase.totalDiscount && calcuatedValueFromPItem.totalDiscountPItem !== 0) {

      throw new Error('Total discount calculated is wrong.');

    }
    if (purchase.totalDiscount && calcuatedValueFromPItem.totalDiscountPItem !== purchase.totalDiscount) {

      throw new Error('Total discount calculated is wrong.');

    }
    if (!purchase.totalTax && calcuatedValueFromPItem.totalTaxPItem !== 0) {

      throw new Error('Total tax calculated is wrong.');

    }
    if (purchase.totalTax && calcuatedValueFromPItem.totalTaxPItem !== purchase.totalTax) {

      throw new Error('Total tax calculated is wrong.');

    }
    if (calcuatedValueFromPItem.totalAmountPItem !== purchase.totalAmount) {

      throw new Error('Total amount calculated is wrong.');

    }
    if (calcuatedValueFromPItem.totalGrandAmountPItem + purchase.roundOff !== purchase.grandTotal) {

      throw new Error('Grand total amount calculated is wrong.');

    }

  };

  public static validatePurchase = async(purchase: PurchaseEntity) => {

    await PurchaseUtil.validatePrimaryValues(purchase);

    let grandT = purchase.totalAmount;
    grandT -= purchase.totalDiscount;
    grandT += purchase.totalTax;
    grandT += purchase.roundOff;
    if (grandT !== purchase.grandTotal) {

      throw new Error('Grand total calcuation is wrong.');

    }

    const calcuatedValueFromPItem = {
      totalDiscountPItem: 0,
      totalTaxPItem: 0,
      totalAmountPItem: 0,
      totalGrandAmountPItem: 0,
    };

    purchase.purchaseItems.reduce((runningObj: any, pItemObj) => {

      let calculatedGT = pItemObj.unitPrice * pItemObj.quantity;
      runningObj.totalAmountPItem += calculatedGT;
      if (pItemObj.discount) {

        calculatedGT -= pItemObj.discount;
        runningObj.totalDiscountPItem += pItemObj.discount;

      }
      if (pItemObj.totalTax) {

        calculatedGT += pItemObj.totalTax;
        runningObj.totalTaxPItem += pItemObj.totalTax;

      }
      if (calculatedGT !== pItemObj.totalAmount) {

        throw new Error('Purchase Item total calculation is wrong.');

      }
      runningObj.totalGrandAmountPItem += pItemObj.totalAmount;
      return runningObj;

    }, calcuatedValueFromPItem);

    for (let index = 0; index < purchase.purchaseItems.length; index++) {

      const pItemObj = purchase.purchaseItems[index];
      PurchaseUtil.validatePurchaseItemValues(pItemObj);
      await PurchaseUtil.validatePurchaseItemValues2(pItemObj);
      PurchaseUtil.validatePurchaseItemValuesDates(pItemObj, purchase);

    }

    PurchaseUtil.validatePurchaseVsItems(purchase, calcuatedValueFromPItem);

    return true;

  }

}
