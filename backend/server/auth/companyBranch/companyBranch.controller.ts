import * as bodyParser from 'body-parser';
import { Router as expressRouter } from 'express';
import {CompanyModel} from '../company/company.model';
import {CompanyBranchModel} from './companyBranch.model';
import { Constants, CompanyBranchS, CompanyBranch as CompanyBranchEntity, Company as CompanyEntity } from 'fivebyone';
import { AuthUtil } from '../../util/auth.util';
import passport = require('passport');

const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED } = Constants;

const router = expressRouter();

const isValidCompanyBranch = async(companyBranch: CompanyBranchEntity): Promise<boolean> => {

  if (!companyBranch.name) {

    return false;

  }
  if (companyBranch.company) {

    const Company = CompanyModel.createModel();
    const company: CompanyEntity = await Company.findById(companyBranch.company._id);

    if (company === null) {

      return false;

    }

  }
  return true;

};

const listCompanyBranches = async(request: any, response: any) => {

  const sessionDetails = AuthUtil.findSessionDetails(request);
  if (!sessionDetails.company) {

    return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

  }
  const CompanyBranch = CompanyBranchModel.createModel(sessionDetails.company);
  const companyBranches = await CompanyBranch.find().populate('company');
  return response.status(HTTP_OK).json(companyBranches);

};

const getCompanyBranch = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const CompanyBranch = CompanyBranchModel.createModel(sessionDetails.company);
    const Company = CompanyModel.createModel();
    const companyBranch = await CompanyBranch.findById(request.params.id).populate({ path: 'company',
      model: Company });
    if (!companyBranch) {

      return response.status(HTTP_BAD_REQUEST).send('No Company branch with the specified id.');

    }
    return response.status(HTTP_OK).json(companyBranch);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};


const saveCompanyBranch = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const CompanyBranch = CompanyBranchModel.createModel(sessionDetails.company);
    const companyBranch = new CompanyBranch(request.body);
    // Should not save if companyBranch group is invalid
    const isValidCompany: boolean = await isValidCompanyBranch(companyBranch);

    if (!isValidCompany) {

      return response.status(HTTP_BAD_REQUEST).send('Company branch should be valid.');

    }
    await companyBranch.save();
    return response.status(HTTP_OK).json(companyBranch);

  } catch (error) {


    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const updateCompanyBranch = async(request: any, response: any) => {

  try {

    const companyBranchId = request.params.id;
    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const CompanyBranch = CompanyBranchModel.createModel(sessionDetails.company);
    const companyBr: CompanyBranchEntity = await CompanyBranch.findById(companyBranchId);

    if (!companyBr) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Invalid company branch Id'));

    }

    const companyBranch = new CompanyBranch(request.body);
    const isValidBranch: boolean = await isValidCompanyBranch(companyBranch);
    if (!isValidBranch) {

      return response.status(HTTP_BAD_REQUEST).send('Company branch group should be valid.');

    }
    const updateObject: CompanyBranchS = request.body;

    await CompanyBranch.update({ _id: companyBranch }, updateObject, { runValidators: true });
    return response.status(HTTP_OK).json(updateObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }


};


const deleteCompanyBranch = async(request: any, response: any) => {

  try {

    const companyBranchId = request.params.id;
    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.company) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const CompanyBranch = CompanyBranchModel.createModel(sessionDetails.company);
    const companyBranch: CompanyBranchEntity = await CompanyBranch.findById(companyBranchId);
    if (!companyBranch) {

      return response.status(HTTP_BAD_REQUEST).send(new Error('Invalid company branch Id'));

    }
    await CompanyBranch.deleteOne({ _id: companyBranchId });
    return response.status(HTTP_OK).json('Company branch deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};


router.route('/:id').get(passport.authenticate('user-jwt', { session: false}), getCompanyBranch);
router.route('/').get(passport.authenticate('user-jwt', { session: false}), listCompanyBranches);
router.route('/').post(passport.authenticate('user-jwt', { session: false}), bodyParser.json(), saveCompanyBranch);
router.route('/:id').put(passport.authenticate('user-jwt', { session: false}), bodyParser.json(), updateCompanyBranch);
router.route('/:id')['delete'](passport.authenticate('user-jwt', { session: false}), deleteCompanyBranch);

export default router;
