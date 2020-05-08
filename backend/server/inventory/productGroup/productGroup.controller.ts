import * as bodyParser from 'body-parser';
import {Router as expressRouter} from 'express';
import { authorize } from '../../config';
import ProductGroup from './productGroup.model';
import {Constants, ProductGroup as ProductGroupEntity, ProductGroupS} from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

const router = expressRouter();


const validateParent = async (productGroup:ProductGroupS, id:string=undefined):Promise<string[]> => {
  let ancestors:string[] = [];
  if(productGroup.parent){
    // If parent exists, then it should be a proper one.
    const parentGroup:ProductGroupEntity = await ProductGroup.findOne({_id: productGroup.parent});
    if(!parentGroup){
      throw ('Parent group doesn\'t exists');
    }
    if(parentGroup.ancestors){
      // if name of the product group contains in the ancestor list, then it is a circular relation.
      if(id && parentGroup.ancestors.indexOf(id) !== -1){
        throw ('Circular relation with parent.');
      }
      ancestors = ancestors.concat(parentGroup.ancestors);
    }
    ancestors.push(productGroup.parent)
  }
  return ancestors;
};


router.route('/').get(authorize, async(unkownVariable, response) => {

  const productGroups = await ProductGroup.find();
  return response.status(HTTP_OK).json(productGroups);

});

router.route('/:id').get(authorize, async(request, response) => {

  try {
    const productGroup = await ProductGroup.findById(request.params.id);
    if(!productGroup){
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
    const ancestors:string[] = await validateParent(productGroup);
    productGroup.ancestors = ancestors;
    await productGroup.save();
    return response.status(HTTP_OK).json(productGroup);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

});

router.route('/:id').put(authorize, bodyParser.json(), async(request, response) => {

  try {
    const id = request.params.id;
    const updateObject:ProductGroupS = request.body;
    const ancestors:string[] = await validateParent(updateObject, id);
    updateObject.ancestors = ancestors;
    await ProductGroup.update({_id: id}, updateObject);
    return response.status(HTTP_OK).json('Product group updated successfully.');

  } catch (error) {
    return response.status(HTTP_BAD_REQUEST).send(error);
  }

});


router.route('/:id').delete(authorize, async(request, response) => {

  try {
   await ProductGroup.deleteOne({_id: request.params.id});
    return response.status(HTTP_OK).json('Product Group deleted successfully.');
  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

});

export default router;
