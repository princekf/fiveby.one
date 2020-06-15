import {Party as PartyEntity} from 'fivebyone';
import {PurchaseModel} from '../purchase/purchase.model';
import { UserSession } from '../../auth/user/UserImpl';
export class PartyUtil {

  public static validateParty = async(party: PartyEntity, sessionDetails: UserSession): Promise<void> => {

    if (!party.isCustomer && !party.isVendor) {

      throw new Error('Party should be either customer or vendor or both');

    }

    // Following validations are onlty for update.
    if (!party._id) {

      return;

    }
    const Purchase = PurchaseModel.createModel(sessionDetails.companyCode);
    const purcahses = await Purchase.find({party});
    if (purcahses.length > 0 && !party.isVendor) {

      throw new Error('Cannot change vendor property, because already purchase is made for these party.');

    }

  };

}
