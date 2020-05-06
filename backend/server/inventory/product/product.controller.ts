import * as bodyParser from 'body-parser';
import {Router as expressRouter} from 'express';
import { authorize } from '../../config';
import Product from './product.model';
import {Constants} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

const router = expressRouter();

router.route('/').get(authorize, async(unkownVariable, response) => {

  const products = await Product.find();
  return response.status(HTTP_OK).json(products);

});

router.route('/').post(authorize, bodyParser.json(), async(request, response) => {

  try {

    const product = new Product(request.body);
    await product.save();
    return response.status(HTTP_OK).json('Product saved!');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

});

export default router;
