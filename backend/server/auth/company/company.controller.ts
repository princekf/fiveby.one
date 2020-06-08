import * as bodyParser from 'body-parser';
import { Router as expressRouter } from 'express';
import {CompanyModel} from './company.model';
import { Constants, CompanyS } from 'fivebyone';
import { AuthUtil } from '../../util/auth.util';

const { HTTP_OK, HTTP_BAD_REQUEST } = Constants;

const router = expressRouter();


const getCompany = async(request: any, response: any) => {

  try {

    const Company = CompanyModel.createModel();
    const company = await Company.findById(request.params.id);
    if (!company) {

      return response.status(HTTP_BAD_REQUEST).send('No company with the specified id.');

    }
    return response.status(HTTP_OK).json(company);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const saveCompany = async(request: any, response: any) => {

  try {

    const Company = CompanyModel.createModel();
    const company = new Company(request.body);
    await company.save();
    return response.status(HTTP_OK).json(company);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const listAllCompany = async(request: any, response: any) => {

  const Company = CompanyModel.createModel();
  const companyShowRooms = await Company.find();
  return response.status(HTTP_OK).json(companyShowRooms);

};

const updateCompany = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const updateUserObject: CompanyS = request.body;
    if (!updateUserObject || updateUserObject && Object.keys(updateUserObject).length === 0) {

      return response.status(HTTP_BAD_REQUEST).json('No body to update');

    }
    delete updateUserObject.email;
    const Company = CompanyModel.createModel();
    await Company.updateOne({ _id: id }, updateUserObject, { runValidators: true });
    return response.status(HTTP_OK).json(updateUserObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const deleteCompany = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const Company = CompanyModel.createModel();
    const resp = await Company.deleteOne({ _id: id });
    if (resp.deletedCount === 0) {

      return response.status(HTTP_BAD_REQUEST).send('No company is deleted.');

    }

    return response.status(HTTP_OK).json('Company deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/:id').get(AuthUtil.authorizeAdmin, getCompany);
router.route('/').get(AuthUtil.authorizeAdmin, listAllCompany);
router.route('/:id').put(AuthUtil.authorizeAdmin, bodyParser.json(), updateCompany);
router.route('/').post(AuthUtil.authorizeAdmin, bodyParser.json(), saveCompany);
router.route('/:id')['delete'](AuthUtil.authorizeAdmin, bodyParser.json(), deleteCompany);

export default router;
