import * as bodyParser from 'body-parser';
import { Router as expressRouter } from 'express';
import { AuthUtil } from '../../util/auth.util';
import { ProductModel } from './product.model';
import {ProductGroupModel} from '../productGroup/productGroup.model';
import { Constants, ProductS, ProductGroup as ProductGroupEntity, Product as ProductEntity } from 'fivebyone';

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;

const router = expressRouter();

const isValidProduct = async(product: ProductEntity, session: any): Promise<boolean> => {

  if (!product.name) {

    return false;

  }
  if (product.group) {

    const sessionDetails = session;
    const ProductGroup = ProductGroupModel.createModel(sessionDetails.company);
    const prdGrp: ProductGroupEntity = await ProductGroup.findById(product.group._id);

    if (prdGrp === null) {

      return false;

    }

  }
  return true;

};

const listProducts = async(_request: any, response: any) => {

  const sessionDetails = AuthUtil.findSessionDetails(_request);
  if (!sessionDetails.company) {

    return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

  }
  const ProductSchema = ProductModel.createModel(sessionDetails.company);
  const products = await ProductSchema.find().populate('group');
  return response.status(HTTP_OK).json(products);

};


const getProduct = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const ProductSchema = ProductModel.createModel(sessionDetails.company);
    const product = await ProductSchema.findById(request.params.id).populate('group');
    if (!product) {

      return response.status(HTTP_BAD_REQUEST).send('No product with the specified id.');

    }
    return response.status(HTTP_OK).json(product);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const saveProduct = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const ProductSchema = ProductModel.createModel(sessionDetails.company);
    const product = new ProductSchema(request.body);
    // Should not save if product group is invalid
    const isValidGroup: boolean = await isValidProduct(product, sessionDetails);
    if (!isValidGroup) {

      return response.status(HTTP_BAD_REQUEST).send('Product group should be valid.');

    }
    if (product.reorderLevel && product.reorderLevel < 0) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Reorder level should be non-negative.'));

    }
    await product.save();
    return response.status(HTTP_OK).json(product);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};


const updateProduct = async(request: any, response: any) => {

  try {

    const productId = request.params.id;
    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const ProductSchema = ProductModel.createModel(sessionDetails.company);
    const productE: ProductEntity = await ProductSchema.findById(productId);
    if (!productE) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Invalid product Id'));

    }

    const product = new ProductSchema(request.body);
    const isValidGroup: boolean = await isValidProduct(product, sessionDetails);
    if (!isValidGroup) {

      return response.status(HTTP_BAD_REQUEST).send('Product group should be valid.');

    }
    const updateObject: ProductS = request.body;

    await ProductSchema.update({ _id: productId }, updateObject);
    return response.status(HTTP_OK).json('Product updated successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const deleteProduct = async(request: any, response: any) => {

  try {

    const productId = request.params.id;
    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const ProductSchema = ProductModel.createModel(sessionDetails.company);
    const product: ProductEntity = await ProductSchema.findById(productId);
    if (!product) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Invalid product Id'));

    }
    await ProductSchema.deleteOne({ _id: productId });
    return response.status(HTTP_OK).json('Product deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/').get(AuthUtil.authorize, listProducts);
router.route('/:id').get(AuthUtil.authorize, getProduct);
router.route('/').post(AuthUtil.authorize, bodyParser.json(), saveProduct);
router.route('/:id').put(AuthUtil.authorize, bodyParser.json(), updateProduct);
router.route('/:id')['delete'](AuthUtil.authorize, deleteProduct);

export default router;
