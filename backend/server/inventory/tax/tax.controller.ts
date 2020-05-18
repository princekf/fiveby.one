import * as bodyParser from 'body-parser';
import {Router as expressRouter} from 'express';
import { authorize } from '../../config';
import Tax from './tax.model';
import {Constants, TaxS} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

const router = expressRouter();

const listTax = async(_request: any, response: any) => {

  const taxes = await Tax.find();
  return response.status(HTTP_OK).json(taxes);

};


const getTax = async(request: any, response: any) => {

  try {

    const tax = await Tax.findById(request.params.id);
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

    const tax = new Tax(request.body);
    await tax.save();
    return response.status(HTTP_OK).json(tax);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const updateTax = async(request: any, response: any) => {

  try {

    const {id} = request.params;

    const updateObject: TaxS = request.body;

    await Tax.update({_id: id}, updateObject, { runValidators: true });
    return response.status(HTTP_OK).json(updateObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const deleteTax = async(request: any, response: any) => {

  try {

    const {id} = request.params;
    const resp = await Tax.deleteOne({_id: id});
    if (resp.deletedCount === 0) {

      return response.status(HTTP_BAD_REQUEST).send('No tax is deleted.');

    }

    return response.status(HTTP_OK).json('Tax deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/').get(authorize, listTax);
router.route('/:id').get(authorize, getTax);
router.route('/').post(authorize, bodyParser.json(), saveTax);
router.route('/:id').put(authorize, bodyParser.json(), updateTax);
router.route('/:id')['delete'](authorize, deleteTax);

export default router;
