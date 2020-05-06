import * as bodyParser from 'body-parser';
import {Router as expressRouter} from 'express';
import { authorize } from '../../config';
import Tax from './tax.model';
import {Constants} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

const router = expressRouter();

router.route('/').get(authorize, async(unkownVariable, response) => {

  const taxes = await Tax.find();
  return response.status(HTTP_OK).json(taxes);

});

router.route('/').post(authorize, bodyParser.json(), async(request, response) => {

  try {

    const tax = new Tax(request.body);
    await tax.save();
    return response.status(HTTP_OK).json('Tax saved!');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

});

export default router;
