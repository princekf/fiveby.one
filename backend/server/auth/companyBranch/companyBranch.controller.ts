import * as bodyParser from 'body-parser';
import { Router as expressRouter } from 'express';
import { authorize } from '../../config';
import Company from '../company/company.model';
import CompanyBranch from './companyBranch.model';
import { Constants, CompanyBranchS, CompanyBranch as CompanyBranchEntity, Company as CompanyEntity } from 'fivebyone';

const { HTTP_OK, HTTP_BAD_REQUEST } = Constants;

const router = expressRouter();

const isValidCompanyBranch = async(companyBranch: CompanyBranchEntity): Promise<boolean> => {

  if (!companyBranch.name) {

    return false;

  }
  if (companyBranch.company) {

    const company: CompanyEntity = await Company.findById(companyBranch.company._id);

    if (company === null) {

      return false;

    }

  }
  return true;

};

const listCompanyBranches = async(_request: any, response: any) => {

  const companyBranches = await CompanyBranch.find().populate('company');
  return response.status(HTTP_OK).json(companyBranches);

};

const getCompanyBranch = async(request: any, response: any) => {

  try {

    const companyBranch = await CompanyBranch.findById(request.params.id).populate('company');
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


router.route('/:id').get(authorize, getCompanyBranch);
router.route('/').get(authorize, listCompanyBranches);
router.route('/').post(authorize, bodyParser.json(), saveCompanyBranch);
router.route('/:id').put(authorize, bodyParser.json(), updateCompanyBranch);
router.route('/:id')['delete'](authorize, deleteCompanyBranch);

export default router;
