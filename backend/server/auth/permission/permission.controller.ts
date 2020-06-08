import * as bodyParser from 'body-parser';
import { Router as expressRouter } from 'express';
import {PermissionModel} from './permission.model';
import { Constants, PermissionS, Permission as PermissionEntity } from 'fivebyone';
import { AuthUtil } from '../../util/auth.util';


const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;

const router = expressRouter();

const listAll = async(request: any, response: any) => {

  const sessionDetails = AuthUtil.findSessionDetails(request);
  if (!sessionDetails.company) {

    return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

  }
  const Permission = PermissionModel.createModel(sessionDetails.company);
  const permissions = await Permission.find();
  return response.status(HTTP_OK).json(permissions);

};


const getPermission = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const Permission = PermissionModel.createModel(sessionDetails.company);
    const permission: PermissionEntity = await Permission.findById(request.params.id);
    if (!permission) {

      return response.status(HTTP_BAD_REQUEST).send('No permission with the specified id.');

    }
    return response.status(HTTP_OK).json(permission);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const savePermission = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const Permission = PermissionModel.createModel(sessionDetails.company);
    const permission = new Permission(request.body);
    await permission.save();
    return response.status(HTTP_OK).json(permission);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }


};

const updatePermission = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const permissionObj: PermissionS = request.body;

    if (Object.keys(permissionObj).length === 0) {

      return response.status(HTTP_BAD_REQUEST).send('Body is empty for an update');

    }

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const Permission = PermissionModel.createModel(sessionDetails.company);
    await Permission.updateOne({ _id: id }, permissionObj, { runValidators: true });
    return response.status(HTTP_OK).json(permissionObj);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const deletePermission = async(request: any, response: any) => {

  try {

    const { id } = request.params;

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const Permission = PermissionModel.createModel(sessionDetails.company);
    const resp = await Permission.deleteOne({ _id: id });
    if (resp.deletedCount === 0) {

      return response.status(HTTP_BAD_REQUEST).send('No permission is deleted.');

    }

    return response.status(HTTP_OK).json('Permission deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/').get(AuthUtil.authorize, listAll);
router.route('/:id').get(AuthUtil.authorize, getPermission);
router.route('/').post(AuthUtil.authorize, bodyParser.json(), savePermission);
router.route('/:id').put(AuthUtil.authorize, bodyParser.json(), updatePermission);
router.route('/:id')['delete'](AuthUtil.authorize, deletePermission);

export default router;
