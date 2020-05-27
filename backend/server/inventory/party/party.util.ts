import {Party as PartyEntity} from 'fivebyone';
import Purchase from '../purchase/purchase.model';
export class PartyUtil {

  public static validateParty = async(party: PartyEntity): Promise<void> => {

    if (!party.isCustomer && !party.isVendor) {

      throw new Error('Party should be either customer or vendor or both');

    }

    // Following validations are onlty for update.
    if (!party._id) {

      return;

    }
    const purcahses = await Purchase.find({party});
    if (purcahses.length > 0 && !party.isVendor) {

      throw new Error('Cannot change vendor property, because already purchase is made for these party.');

    }

  };

}
