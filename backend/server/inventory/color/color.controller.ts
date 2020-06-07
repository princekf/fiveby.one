import {Router as expressRouter} from 'express';
import { authorize } from '../../passport-util';
import Product from '../product/product.model';
import {Constants} from 'fivebyone';

const {HTTP_OK} = Constants;

const router = expressRouter();

const listColors = async(_request: any, response: any) => {

  const colors = await Product.distinct('colors');
  return response.status(HTTP_OK).json(colors.filter(Boolean));

};

router.route('/').get(authorize, listColors);

export default router;

