import * as bodyParser from 'body-parser';
import {Router as expressRouter} from 'express';
import { authorize } from '../../passport-util';
import Purchase from './purchase.model';
import {Constants} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

const router = expressRouter();

const savePurchase = async(request: any, response: any) => {

  try {

    const purchase = new Purchase(request.body);
    await purchase.save();
    return response.status(HTTP_OK).json(purchase);

  } catch (error) {

    // Console.log(error);

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};
const getPurchase = async(request: any, response: any) => {

  try {

    const purchase = await Purchase.findById(request.params.id)
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
router.route('/:id').get(authorize, getPurchase);
router.route('/').post(authorize, bodyParser.json(), savePurchase);

/*
 * Router.route('/:id').put(authorize, bodyParser.json(), updateTax);
 * router.route('/:id')['delete'](authorize, deleteTax);
 */

export default router;
