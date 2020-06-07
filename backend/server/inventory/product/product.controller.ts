import * as bodyParser from 'body-parser';
import {Router as expressRouter} from 'express';
import { authorize } from '../../passport-util';
import Product from './product.model';
import ProductGroup from '../productGroup/productGroup.model';
import {Constants, ProductS, ProductGroup as ProductGroupEntity, Product as ProductEntity} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

const router = expressRouter();

const isValidProduct = async(product: ProductEntity): Promise<boolean> => {

  if (!product.name) {

    return false;

  }
  if (product.group) {

    const prdGrp: ProductGroupEntity = await ProductGroup.findById(product.group._id);

    if (prdGrp === null) {

      return false;

    }

  }
  return true;

};

const listProducts = async(_request: any, response: any) => {

  const products = await Product.find().populate('group');
  return response.status(HTTP_OK).json(products);

};


const getProduct = async(request: any, response: any) => {

  try {

    const product = await Product.findById(request.params.id).populate('group');
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

    const product = new Product(request.body);
    // Should not save if product group is invalid
    const isValidGroup: boolean = await isValidProduct(product);
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

    const productE: ProductEntity = await Product.findById(productId);
    if (!productE) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Invalid product Id'));

    }

    const product = new Product(request.body);
    const isValidGroup: boolean = await isValidProduct(product);
    if (!isValidGroup) {

      return response.status(HTTP_BAD_REQUEST).send('Product group should be valid.');

    }
    const updateObject: ProductS = request.body;

    await Product.update({_id: productId}, updateObject);
    return response.status(HTTP_OK).json('Product updated successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const deleteProduct = async(request: any, response: any) => {

  try {

    const productId = request.params.id;
    const product: ProductEntity = await Product.findById(productId);
    if (!product) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Invalid product Id'));

    }
    await Product.deleteOne({_id: productId});
    return response.status(HTTP_OK).json('Product deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/').get(authorize, listProducts);
router.route('/:id').get(authorize, getProduct);
router.route('/').post(authorize, bodyParser.json(), saveProduct);
router.route('/:id').put(authorize, bodyParser.json(), updateProduct);
router.route('/:id')['delete'](authorize, deleteProduct);

export default router;
