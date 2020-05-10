import {Router as expressRouter} from 'express';
import { authorize } from '../../config';
import Product from '../product/product.model';
import {Constants} from 'fivebyone';

const {HTTP_OK} = Constants;

const router = expressRouter();

const listBrands = async(_request: any, response: any) => {

  const brands = await Product.distinct('brand');
  return response.status(HTTP_OK).json(brands);

};

router.route('/').get(authorize, listBrands);

export default router;

