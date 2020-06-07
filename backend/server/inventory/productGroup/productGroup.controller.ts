import * as bodyParser from 'body-parser';
import {Router as expressRouter} from 'express';
import { authorize } from '../../passport-util';
import ProductGroup from './productGroup.model';
import Product from '../product/product.model';
import {Constants, ProductGroup as ProductGroupEntity,
  ProductGroupS, Product as ProdutEntity} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

const router = expressRouter();


const validateParentAndFindAncestors =
async(productGroup: ProductGroupS, productGroupId: string = null): Promise<string[]> => {

  let ancestors: string[] = [];
  if (productGroup.parent) {

    // Either it should be a object or id
    const parentId = productGroup.parent._id ? productGroup.parent._id : productGroup.parent;

    // If parent exists, then it should be a proper one.
    const parentGroup: ProductGroupEntity = await ProductGroup.findOne({_id: parentId});

    if (!parentGroup) {

      throw new Error('Parent group doesn\'t exists');

    }

    if (parentGroup.ancestors && parentGroup.ancestors.length > 0) {

      // If name of the product group contains in the ancestor list, then it is a circular relation.
      if (productGroupId && parentGroup.ancestors.indexOf(productGroupId) !== -1) {

        throw new Error('Circular relation with parent.');

      }
      ancestors = ancestors.concat(parentGroup.ancestors);

    }
    ancestors.push(parentGroup._id);

  }
  return ancestors;

};


const listProductGroup = async(_request: any, response: any) => {

  const productGroups = await ProductGroup.find().populate('parent');
  return response.status(HTTP_OK).json(productGroups);

};

const getProductGroup = async(request: any, response: any) => {

  try {

    const productGroup = await ProductGroup.findById(request.params.id).populate('parent');
    if (!productGroup) {

      return response.status(HTTP_BAD_REQUEST).send('No product group with the specified id.');

    }
    return response.status(HTTP_OK).json(productGroup);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};


const saveProductGroup = async(request: any, response: any) => {

  try {

    const productGroup = new ProductGroup(request.body);
    const ancestors: string[] = await validateParentAndFindAncestors(productGroup);
    productGroup.ancestors = ancestors;
    await productGroup.save();
    return response.status(HTTP_OK).json(productGroup);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const updateProductGroup = async(request: any, response: any) => {

  try {

    const {id} = request.params;
    const updateObject: ProductGroupS = request.body;
    const ancestors: string[] = await validateParentAndFindAncestors(updateObject, id);
    updateObject.ancestors = ancestors;

    await ProductGroup.update({_id: id}, updateObject);
    return response.status(HTTP_OK).json(updateObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};


const deleteProductGroup = async(request: any, response: any) => {

  try {

    const productGroupId = request.params.id;
    // If it is a parent group, then can't be deleted.
    const productGroupsSelected: ProductGroupEntity[] = await ProductGroup.find({ancestors: productGroupId});
    if (productGroupsSelected && productGroupsSelected.length > 0) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Cannot delete a parent group'));

    }

    const products: ProdutEntity[] = await Product.find({group: productGroupId});
    if (products && products.length > 0) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Cant delete a group which has products'));

    }

    await ProductGroup.deleteOne({_id: productGroupId});
    return response.status(HTTP_OK).json('Product Group deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};


router.route('/').get(authorize, listProductGroup);
router.route('/:id').get(authorize, getProductGroup);
router.route('/').post(authorize, bodyParser.json(), saveProductGroup);
router.route('/:id').put(authorize, bodyParser.json(), updateProductGroup);
router.route('/:id')['delete'](authorize, deleteProductGroup);

export default router;
