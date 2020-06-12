import * as bodyParser from 'body-parser';
import { Router as expressRouter } from 'express';
import { AuthUtil } from '../../util/auth.util';
import { TaxModel } from './tax.model';
import { Constants, TaxS } from 'fivebyone';
import passport = require('passport');

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;

const router = expressRouter();

const listTax = async(_request: any, response: any) => {

  const sessionDetails = AuthUtil.findSessionDetails(_request);
  if (!sessionDetails.company) {

    return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

  }
  const TaxSchema = TaxModel.createModel(sessionDetails.company);
  const taxes = await TaxSchema.find();
  return response.status(HTTP_OK).json(taxes);

};


const getTax = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const TaxSchema = TaxModel.createModel(sessionDetails.company);
    const tax = await TaxSchema.findById(request.params.id);
    if (!tax) {

      return response.status(HTTP_BAD_REQUEST).send('No tax with the specified id.');

    }
    return response.status(HTTP_OK).json(tax);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const saveTax = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const TaxSchema = TaxModel.createModel(sessionDetails.company);
    const tax = new TaxSchema(request.body);
    await tax.save();
    return response.status(HTTP_OK).json(tax);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const updateTax = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const { id } = request.params;
    const updateObject: TaxS = request.body;
    const TaxSchema = TaxModel.createModel(sessionDetails.company);
    await TaxSchema.update({ _id: id }, updateObject, { runValidators: true });
    return response.status(HTTP_OK).json(updateObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const deleteTax = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const TaxSchema = TaxModel.createModel(sessionDetails.company);
    const { id } = request.params;
    const resp = await TaxSchema.deleteOne({ _id: id });
    if (resp.deletedCount === 0) {

      return response.status(HTTP_BAD_REQUEST).send('No tax is deleted.');

    }

    return response.status(HTTP_OK).json('Tax deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/').get(passport.authenticate('user-jwt', { session: false}), listTax);
router.route('/:id').get(passport.authenticate('user-jwt', { session: false}), getTax);
router.route('/').post(passport.authenticate('user-jwt', { session: false}), bodyParser.json(), saveTax);
router.route('/:id').put(passport.authenticate('user-jwt', { session: false}), bodyParser.json(), updateTax);
router.route('/:id')['delete'](passport.authenticate('user-jwt', { session: false}), deleteTax);

export default router;
