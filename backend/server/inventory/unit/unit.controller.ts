import * as bodyParser from 'body-parser';
import { Router as expressRouter } from 'express';
import { AuthUtil } from '../../util/auth.util';
import { UnitModel } from './unit.model';
import { ProductModel } from '../product/product.model';
import { Constants, Unit as UnitEntity, UnitS, Product as ProductEntity } from 'fivebyone';

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;

const router = expressRouter();


const validateParentAndFindAncestors =
  async(unit: UnitS, UnitSchema: any, unitId: string = null): Promise<string[]> => {

    let ancestors: string[] = [];
    if (unit.baseUnit) {

      // Either it should be a object or id
      const parentId = unit.baseUnit._id ? unit.baseUnit._id : unit.baseUnit;

      // If parent exists, then it should be a proper one.
      const baseUnit: UnitEntity = await UnitSchema.findOne({ _id: parentId });

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


const listUnit = async(request: any, response: any) => {

  const sessionDetails = AuthUtil.findSessionDetails(request);
  if (!sessionDetails.company) {

    return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

  }
  const UnitSchema = UnitModel.createModel(sessionDetails.company);
  const units = await UnitSchema.find().populate('baseUnit');
  return response.status(HTTP_OK).json(units);

};

const getUnit = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const UnitSchema = UnitModel.createModel(sessionDetails.company);
    const unit = await UnitSchema.findById(request.params.id).populate('baseUnit');
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

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const UnitSchema = UnitModel.createModel(sessionDetails.company);
    const unit = new UnitSchema(request.body);
    const ancestors: string[] = await validateParentAndFindAncestors(unit, UnitSchema);
    unit.ancestors = ancestors;
    await unit.save();
    return response.status(HTTP_OK).json(unit);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const updateUnit = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const updateObject = request.body;
    const ancestors: string[] = await validateParentAndFindAncestors(updateObject, updateObject, id);
    updateObject.ancestors = ancestors;
    const UnitSchema = UnitModel.createModel(updateObject.company);
    await UnitSchema.update({ _id: id }, updateObject, { runValidators: true });
    return response.status(HTTP_OK).json(updateObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};


const deleteUnit = async(request: any, response: any) => {

  try {

    const unitId = request.params.id;
    // If it is a parent group, then can't be deleted.
    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const UnitSchema = UnitModel.createModel(sessionDetails.company);
    const unitSelected: UnitEntity[] = await UnitSchema.find({ ancestors: unitId });
    if (unitSelected && unitSelected.length > 0) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Cannot delete base unit'));

    }
    const ProductSchema = ProductModel.createModel(sessionDetails.company);
    const products: ProductEntity[] = await ProductSchema.find({ unit: unitId });
    if (products && products.length > 0) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Cant delete a unit which has products'));

    }

    await UnitSchema.deleteOne({ _id: unitId });
    return response.status(HTTP_OK).json('Unit deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/').get(AuthUtil.authorize, listUnit);
router.route('/:id').get(AuthUtil.authorize, getUnit);
router.route('/').post(AuthUtil.authorize, bodyParser.json(), saveUnit);
router.route('/:id').put(AuthUtil.authorize, bodyParser.json(), updateUnit);
router.route('/:id')['delete'](AuthUtil.authorize, deleteUnit);

export default router;
