import { Router as expressRouter } from 'express';
import { CompanyModel, CompanyDoc } from './company.model';
import { Constants, CompanyS } from 'fivebyone';
import * as passport from 'passport';
import { Model } from 'mongoose';

const { HTTP_OK, HTTP_BAD_REQUEST } = Constants;

const router = expressRouter();


const getCompany = async(request: any, response: any) => {

  try {

    const Company = CompanyModel.createModel();
    const company = await Company.findById(request.params.id);
    if (!company) {

      return response.status(HTTP_BAD_REQUEST).send({ message: 'No company with the specified id.' });

    }
    return response.status(HTTP_OK).json(company);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send({ message: `Company data could not be fetched\n${error}` });

  }

};

const saveCompany = async(request: any, response: any) => {

  try {

    const Company: Model<CompanyDoc> = CompanyModel.createModel();
    const company = new Company(request.body);
    await company.setCode();
    await company.save();
    return response.status(HTTP_OK).json(company);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send({ message: `Company data could not be saved\n${error}` });

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

      return response.status(HTTP_BAD_REQUEST).send({ message: 'No body to update' });

    }
    delete updateUserObject.email;
    const Company = CompanyModel.createModel();
    await Company.updateOne({ _id: id }, updateUserObject, { runValidators: true });
    return response.status(HTTP_OK).json(updateUserObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send({ message: `Could not update company\n${error}` });

  }

};

const deleteCompany = async(request: any, response: any) => {

  try {

    const { id } = request.params;
    const Company = CompanyModel.createModel();
    const resp = await Company.deleteOne({ _id: id });
    if (resp.deletedCount === 0) {

      return response.status(HTTP_BAD_REQUEST).send({ message: 'No company deleted. Check the company id.' });

    }

    return response.status(HTTP_OK).json('Company deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send({ message: `Company could not be deleted\n${error}` });

  }

};

router.route('/').get(passport.authenticate('admin-jwt', { session: false}), listAllCompany);
router.route('/:id').get(passport.authenticate('admin-jwt', { session: false}), getCompany);
router.route('/:id').put(passport.authenticate('admin-jwt', { session: false}), updateCompany);
router.route('/').post(passport.authenticate('admin-jwt', { session: false}), saveCompany);
router.route('/:id')['delete'](passport.authenticate('admin-jwt', { session: false}), deleteCompany);

export default router;
