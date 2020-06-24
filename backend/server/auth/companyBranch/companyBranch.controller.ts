import * as bodyParser from 'body-parser';
import { Router as expressRouter } from 'express';
import {CompanyModel} from '../company/company.model';
import {CompanyBranchModel} from './companyBranch.model';
import { Constants, CompanyBranchS, CompanyBranch as CompanyBranchEntity } from 'fivebyone';
import { AuthUtil } from '../../util/auth.util';
import passport = require('passport');

const { HTTP_OK, HTTP_BAD_REQUEST } = Constants;

const router = expressRouter();

const listCompanyBranches = async(request: any, response: any) => {

  const sessionDetails = AuthUtil.findSessionDetails(request);
  const CompanyBranch = CompanyBranchModel.createModel(sessionDetails.companyCode);
  const companyBranches = await CompanyBranch.find().populate('company');
  return response.status(HTTP_OK).json(companyBranches);

};

const getCompanyBranch = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    const CompanyBranch = CompanyBranchModel.createModel(sessionDetails.companyCode);
    const Company = CompanyModel.createModel();
    const companyBranch = await CompanyBranch.findById(request.params.id).populate({ path: 'company',
      model: Company });
    if (!companyBranch) {

      return response.status(HTTP_BAD_REQUEST).send({ message: 'No Company branch with the specified id.' });

    }
    return response.status(HTTP_OK).json(companyBranch);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send({ message: `Could not fetch company branch\n${error}` });

  }

};


const saveCompanyBranch = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    const CompanyBranch = CompanyBranchModel.createModel(sessionDetails.companyCode);
    const companyBranch = new CompanyBranch(request.body);
    await companyBranch.save();
    return response.status(HTTP_OK).json(companyBranch);

  } catch (error) {


    return response.status(HTTP_BAD_REQUEST).send({ message: `Could not save company branch\n${error}` });

  }

};

const updateCompanyBranch = async(request: any, response: any) => {

  try {

    const companyBranchId = request.params.id;
    const sessionDetails = AuthUtil.findSessionDetails(request);
    const CompanyBranch = CompanyBranchModel.createModel(sessionDetails.companyCode);
    const companyBr: CompanyBranchEntity = await CompanyBranch.findById(companyBranchId);

    if (!companyBr) {

      return response.status(HTTP_BAD_REQUEST).send({ message: 'Invalid company branch Id' });

    }

    const companyBranch = new CompanyBranch(request.body);
    const updateObject: CompanyBranchS = request.body;

    await CompanyBranch.update({ _id: companyBranch }, updateObject, { runValidators: true });
    return response.status(HTTP_OK).json(updateObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send({ message: `Could not update company branch\n${error}` });

  }


};


const deleteCompanyBranch = async(request: any, response: any) => {

  try {

    const companyBranchId = request.params.id;
    const sessionDetails = AuthUtil.findSessionDetails(request);
    const CompanyBranch = CompanyBranchModel.createModel(sessionDetails.companyCode);
    const companyBranch: CompanyBranchEntity = await CompanyBranch.findById(companyBranchId);
    if (!companyBranch) {

      return response.status(HTTP_BAD_REQUEST).send({ message: 'Company Branch could not be found' });

    }
    await CompanyBranch.deleteOne({ _id: companyBranchId });
    return response.status(HTTP_OK).json('Company branch deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send({ message: `Could not delete company branch\n${error}` });

  }

};


router.route('/:id').get(passport.authenticate('user-jwt', { session: false}), getCompanyBranch);
router.route('/').get(passport.authenticate('user-jwt', { session: false}), listCompanyBranches);
router.route('/').post(passport.authenticate('user-jwt', { session: false}), bodyParser.json(), saveCompanyBranch);
router.route('/:id').put(passport.authenticate('user-jwt', { session: false}), bodyParser.json(), updateCompanyBranch);
router.route('/:id')['delete'](passport.authenticate('user-jwt', { session: false}), deleteCompanyBranch);

export default router;
