import * as bodyParser from 'body-parser';
import {Router as expressRouter} from 'express';
import { authorize } from '../../config';
import ProductGroup from './productGroup.model';
import {Constants, ProductGroup as ProductGroupEntity, ProductGroupS} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

const router = expressRouter();


const validateParentAndFindAncestors =
async(productGroup: ProductGroupS, productGroupId: string = null): Promise<string[]> => {

  let ancestors: string[] = [];
  if (productGroup.parent) {

    // If parent exists, then it should be a proper one.
    const parentGroup: ProductGroupEntity = await ProductGroup.findOne({_id: productGroup.parent._id});

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
    ancestors.push(productGroup.parent._id);

  }
  return ancestors;

};


router.route('/').get(authorize, async(unkownVariable, response) => {

  const productGroups = await ProductGroup.find().populate('parent');
  return response.status(HTTP_OK).json(productGroups);

});

router.route('/:id').get(authorize, async(request, response) => {

  try {

    const productGroup = await ProductGroup.findById(request.params.id).populate('parent');
    if (!productGroup) {

      return response.status(HTTP_BAD_REQUEST).send('No product group with the specified id.');

    }
    return response.status(HTTP_OK).json(productGroup);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

});


router.route('/').post(authorize, bodyParser.json(), async(request, response) => {

  try {

    const productGroup = new ProductGroup(request.body);
    const ancestors: string[] = await validateParentAndFindAncestors(productGroup);
    productGroup.ancestors = ancestors;
    await productGroup.save();
    return response.status(HTTP_OK).json(productGroup);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

});

router.route('/:id').put(authorize, bodyParser.json(), async(request, response) => {

  try {

    const {id} = request.params;
    const updateObject: ProductGroupS = request.body;
    const ancestors: string[] = await validateParentAndFindAncestors(updateObject, id);
    updateObject.ancestors = ancestors;

    await ProductGroup.update({_id: id}, updateObject);
    return response.status(HTTP_OK).json('Product group updated successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

});


router.route('/:id')['delete'](authorize, async(request, response) => {

  try {

    const productGroupId = request.params.id;
    // If it is a parent group, then can't be deleted.
    const productGroupsSelected: ProductGroupEntity[] = await ProductGroup.find({ancestors: productGroupId});
    if (productGroupsSelected && productGroupsSelected.length > 0) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Cannot delete a parent group'));

    }
    await ProductGroup.deleteOne({_id: productGroupId});
    return response.status(HTTP_OK).json('Product Group deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

});

export default router;
