import * as bodyParser from 'body-parser';
import {Router as expressRouter} from 'express';
import { authorize } from '../../passport-util';
import Unit from './unit.model';
import Product from '../product/product.model';
import {Constants, Unit as UnitEntity, UnitS, Product as ProductEntity } from 'fivebyone';

const {HTTP_OK, HTTP_BAD_REQUEST} = Constants;

const router = expressRouter();


const validateParentAndFindAncestors =
async(unit: UnitS, unitId: string = null): Promise<string[]> => {

  let ancestors: string[] = [];
  if (unit.baseUnit) {

    // Either it should be a object or id
    const parentId = unit.baseUnit._id ? unit.baseUnit._id : unit.baseUnit;

    // If parent exists, then it should be a proper one.
    const baseUnit: UnitEntity = await Unit.findOne({_id: parentId});

    if (!baseUnit) {

      throw new Error('Base unit doesn\'t exists');

    }

    if (baseUnit.ancestors && baseUnit.ancestors.length > 0) {

      // If name of the product group contains in the ancestor list, then it is a circular relation.
      if (unitId && baseUnit.ancestors.indexOf(unitId) !== -1) {

        throw new Error('Circular relation with base unit.');

      }
      ancestors = ancestors.concat(baseUnit.ancestors);

    }
    ancestors.push(baseUnit._id);

  }
  return ancestors;

};


const listUnit = async(_request: any, response: any) => {

  const units = await Unit.find().populate('baseUnit');
  return response.status(HTTP_OK).json(units);

};

const getUnit = async(request: any, response: any) => {

  try {

    const unit = await Unit.findById(request.params.id).populate('baseUnit');
    if (!unit) {

      return response.status(HTTP_BAD_REQUEST).send('No unit with the specified id.');

    }
    return response.status(HTTP_OK).json(unit);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};


const saveUnit = async(request: any, response: any) => {

  try {

    const unit = new Unit(request.body);
    const ancestors: string[] = await validateParentAndFindAncestors(unit);
    unit.ancestors = ancestors;
    await unit.save();
    return response.status(HTTP_OK).json(unit);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const updateUnit = async(request: any, response: any) => {

  try {

    const {id} = request.params;
    const updateObject: UnitS = request.body;
    const ancestors: string[] = await validateParentAndFindAncestors(updateObject, id);
    updateObject.ancestors = ancestors;

    await Unit.update({_id: id}, updateObject, { runValidators: true });
    return response.status(HTTP_OK).json(updateObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};


const deleteUnit = async(request: any, response: any) => {

  try {

    const unitId = request.params.id;
    // If it is a parent group, then can't be deleted.
    const unitSelected: UnitEntity[] = await Unit.find({ancestors: unitId});
    if (unitSelected && unitSelected.length > 0) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Cannot delete base unit'));

    }

    const products: ProductEntity[] = await Product.find({unit: unitId});
    if (products && products.length > 0) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Cant delete a unit which has products'));

    }

    await Unit.deleteOne({_id: unitId});
    return response.status(HTTP_OK).json('Unit deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/').get(authorize, listUnit);
router.route('/:id').get(authorize, getUnit);
router.route('/').post(authorize, bodyParser.json(), saveUnit);
router.route('/:id').put(authorize, bodyParser.json(), updateUnit);
router.route('/:id')['delete'](authorize, deleteUnit);

export default router;
