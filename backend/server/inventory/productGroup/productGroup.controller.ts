import * as bodyParser from 'body-parser';
import { Router as expressRouter } from 'express';
import { AuthUtil } from '../../util/auth.util';
import { ProductGroupModel } from './productGroup.model';
import { ProductModel } from '../product/product.model';
import {
  Constants, ProductGroup as ProductGroupEntity,
  ProductGroupS, Product as ProdutEntity
} from 'fivebyone';
import passport = require('passport');

const { HTTP_OK, HTTP_BAD_REQUEST } = Constants;

const router = expressRouter();

const findProductGroup = (productGroups: Array<ProductGroupEntity>, productGroupId: string): boolean => {

  const prGroup: ProductGroupEntity = productGroups.find((productGr: ProductGroupEntity) => {

    return productGr._id.toString() === productGroupId;

  });
  return Boolean(prGroup);

};

const validateParentAndFindAncestors = async(productGroup: ProductGroupS, ProductGroupSchema: any,
  productGroupE?: string): Promise<ProductGroupEntity[]> => {

  let ancestors: ProductGroupEntity[] = [];
  if (productGroup.parent) {

    // Either it should be a object or id
    const parentId = productGroup.parent._id ? productGroup.parent._id : productGroup.parent;

    // If parent exists, then it should be a proper one.
    const parentGroup: ProductGroupEntity = await ProductGroupSchema.findOne({ _id: parentId })
      .populate({
        path: 'ancestors',
        model: ProductGroupSchema
      });

    if (!parentGroup) {

      throw new Error('Parent group doesn\'t exists');

    }

    if (parentGroup.ancestors && parentGroup.ancestors.length > 0) {

      // If name of the product group contains in the ancestor list, then it is a circular relation.
      if (productGroupE && findProductGroup(parentGroup.ancestors, productGroupE)) {

        throw new Error('Circular relation with parent.');

      }
      ancestors = ancestors.concat(parentGroup.ancestors);

    }
    ancestors.push(parentGroup);

  }
  return ancestors;

};


const listProductGroup = async(_request: any, response: any) => {

  const sessionDetails = AuthUtil.findSessionDetails(_request);
  try {

    const ProductGroupSchema = ProductGroupModel.createModel(sessionDetails.companyCode);
    const productGroups = await ProductGroupSchema.find()
      .populate({
        path: 'parent',
        model: ProductGroupSchema
      })
      .populate({
        path: 'ancestors',
        model: ProductGroupSchema
      });
    return response.status(HTTP_OK).json(productGroups);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).json({ message: `List product group failed \n${error}` });

  }

};

const getProductGroup = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    const ProductGroupSchema = ProductGroupModel.createModel(sessionDetails.companyCode);
    const productGroup = await ProductGroupSchema.findById(request.params.id)
      .populate({path: 'parent',
        model: ProductGroupSchema });

    if (!productGroup) {

      return response.status(HTTP_BAD_REQUEST).send('No product group with the specified id.');

    }
    return response.status(HTTP_OK).json(productGroup);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send({ message: `fetch product failed \n${error}` });

  }

};


const saveProductGroup = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    const ProductGroupSchema = ProductGroupModel.createModel(sessionDetails.companyCode);
    const productGroup = new ProductGroupSchema(request.body);
    const ancestors: ProductGroupEntity[] = await validateParentAndFindAncestors(productGroup, ProductGroupSchema);
    productGroup.ancestors = ancestors;
    await productGroup.save();
    return response.status(HTTP_OK).json(productGroup);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send({ message: `Error when saving a product group\n${error}` });

  }

};

const updateProductGroup = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    const { id } = request.params;
    let updateObject: ProductGroupS = request.body;
    const ProductGroupSchema = ProductGroupModel.createModel(sessionDetails.companyCode);
    const ancestors: ProductGroupEntity[] = await validateParentAndFindAncestors(updateObject, ProductGroupSchema, id);
    updateObject.ancestors = ancestors;
    updateObject = await ProductGroupSchema.findOneAndUpdate({ _id: id }, updateObject);
    return response.status(HTTP_OK).json(updateObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send({message: `Error when updating the product group \n ${error}`});

  }

};


const deleteProductGroup = async(request: any, response: any) => {

  try {

    const productGroupId = request.params.id;
    // If it is a parent group, then can't be deleted.
    const sessionDetails = AuthUtil.findSessionDetails(request);
    const ProductGroupSchema = ProductGroupModel.createModel(sessionDetails.companyCode);
    const productGroupsSelected: ProductGroupEntity[] = await ProductGroupSchema.find({ ancestors: productGroupId });
    if (productGroupsSelected && productGroupsSelected.length > 0) {

      return response.status(HTTP_BAD_REQUEST).send({message: 'Cannot delete a parent group'});

    }
    const ProductSchema = ProductModel.createModel(sessionDetails.companyCode);
    const products: ProdutEntity[] = await ProductSchema.find({ group: productGroupId });
    if (products && products.length > 0) {

      return response.status(HTTP_BAD_REQUEST).send({message: 'Cant delete a group which has products'});

    }

    await ProductGroupSchema.deleteOne({ _id: productGroupId });
    return response.status(HTTP_OK).json('Product Group deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/').get(passport.authenticate('user-jwt', { session: false}), listProductGroup);
router.route('/:id').get(passport.authenticate('user-jwt', { session: false}), getProductGroup);
router.route('/').post(passport.authenticate('user-jwt', { session: false}), bodyParser.json(), saveProductGroup);
router.route('/:id').put(passport.authenticate('user-jwt', { session: false}), bodyParser.json(), updateProductGroup);
router.route('/:id')['delete'](passport.authenticate('user-jwt', { session: false}), deleteProductGroup);

export default router;
