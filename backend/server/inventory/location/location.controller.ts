import {Router as expressRouter} from 'express';
import {ProductModel} from '../product/product.model';
import {Constants} from 'fivebyone';
import { AuthUtil } from '../../util/auth.util';

const {HTTP_OK, HTTP_UNAUTHORIZED} = Constants;

const router = expressRouter();

const listLocations = async(_request: any, response: any) => {
  const sessionDetails = AuthUtil.findSessionDetails(_request);
  if (!sessionDetails.company) {

    return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

  }
  const Product = ProductModel.createModel(sessionDetails.company);
  const locations = await Product.distinct('location');
  return response.status(HTTP_OK).json(locations);

};

router.route('/').get(AuthUtil.authorize, listLocations);

export default router;

