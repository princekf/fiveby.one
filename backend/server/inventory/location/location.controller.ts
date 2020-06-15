import {Router as expressRouter} from 'express';
import {ProductModel} from '../product/product.model';
import {Constants} from 'fivebyone';
import { AuthUtil } from '../../util/auth.util';
import passport = require('passport');

const {HTTP_OK, HTTP_UNAUTHORIZED} = Constants;

const router = expressRouter();

const listLocations = async(_request: any, response: any) => {

  const sessionDetails = AuthUtil.findSessionDetails(_request);
  if (!sessionDetails.companyCode) {

    return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

  }
  const Product = ProductModel.createModel(sessionDetails.companyCode);
  const locations = await Product.distinct('location');
  return response.status(HTTP_OK).json(locations);

};

router.route('/').get(passport.authenticate('user-jwt', { session: false}), listLocations);

export default router;

