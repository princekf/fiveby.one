import {Router as expressRouter} from 'express';
import { authorize } from '../../config';
import Product from '../product/product.model';
import {Constants} from 'fivebyone';

const {HTTP_OK} = Constants;

const router = expressRouter();

const listUnits = async(_request: any, response: any) => {

  const units = await Product.distinct('unit');
  return response.status(HTTP_OK).json(units);

};

router.route('/').get(authorize, listUnits);

export default router;

