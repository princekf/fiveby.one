import {Router as expressRouter} from 'express';
import { authorize } from '../../config';
import Product from '../product/product.model';
import {Constants} from 'fivebyone';

const {HTTP_OK} = Constants;

const router = expressRouter();

const listLocations = async(_request: any, response: any) => {

  const locations = await Product.distinct('location');
  return response.status(HTTP_OK).json(locations);

};

router.route('/').get(authorize, listLocations);

export default router;

