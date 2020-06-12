import * as bodyParser from 'body-parser';
import { Router as expressRouter } from 'express';
import { AuthUtil } from '../../util/auth.util';
import { PurchaseModel } from './purchase.model';
import { Constants } from 'fivebyone';
import passport = require('passport');

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;

const router = expressRouter();

const savePurchase = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const PurchaseSchema = PurchaseModel.createModel(sessionDetails.company);
    const purchase = new PurchaseSchema(request.body);
    await purchase.save();
    return response.status(HTTP_OK).json(purchase);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};
const getPurchase = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const PurchaseSchema = PurchaseModel.createModel(sessionDetails.company);
    const purchase = await PurchaseSchema.findById(request.params.id)
      .populate('party')
      .populate('purchaseItems.product')
      .populate('purchaseItems.unit')
      .populate('purchaseItems.taxes');
    if (!purchase) {

      return response.status(HTTP_BAD_REQUEST).send('No purchase with the specified id.');

    }
    return response.status(HTTP_OK).json(purchase);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

// Router.route('/').get(authorize, listTax);
router.route('/:id').get(passport.authenticate('user-jwt', { session: false}), getPurchase);
router.route('/').post(passport.authenticate('user-jwt', { session: false}), bodyParser.json(), savePurchase);

/*
 * Router.route('/:id').put(authorize, bodyParser.json(), updateTax);
 * router.route('/:id')['delete'](authorize, deleteTax);
 */

export default router;
