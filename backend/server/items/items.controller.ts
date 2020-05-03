import * as bodyParser from 'body-parser';
import {Router as expressRouter} from 'express';
import { authorize } from '../config';
import Item from './item.model';
import {Constants} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

const router = expressRouter();

router.route('/').get(authorize, async(unkownVariable, response) => {

  const items = await Item.find();
  return response.status(HTTP_OK).json(items);

});

router.route('/').post(authorize, bodyParser.json(), async(request, response) => {

  try {

    const item = new Item(request.body);
    await item.save();
    return response.status(HTTP_OK).json('Item saved!');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

});

export default router;
