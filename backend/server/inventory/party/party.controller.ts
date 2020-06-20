import * as bodyParser from 'body-parser';
import {Router as expressRouter} from 'express';
// Import { authorize } from '../../passport-util';
import {PartyModel} from './party.model';
import {Constants, PartyS} from 'fivebyone';
import { PartyUtil } from './party.util';
import { AuthUtil } from '../../util/auth.util';
import passport = require('passport');

const {HTTP_OK, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED} = Constants;

const router = expressRouter();

const listParty = async(_request: any, response: any) => {

  const sessionDetails = AuthUtil.findSessionDetails(_request);
  if (!sessionDetails.companyCode) {

    return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

  }
  const Party = PartyModel.createModel(sessionDetails.companyCode);
  const taxes = await Party.find();
  return response.status(HTTP_OK).json(taxes);

};


const getParty = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.companyCode) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const Party = PartyModel.createModel(sessionDetails.companyCode);
    const party = await Party.findById(request.params.id);
    if (!party) {

      return response.status(HTTP_BAD_REQUEST).send('No party with the specified id.');

    }
    return response.status(HTTP_OK).json(party);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const saveParty = async(request: any, response: any) => {

  try {

    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.companyCode) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const Party = PartyModel.createModel(sessionDetails.companyCode);

    const party = new Party(request.body);

    if (request.body.isCustomer === false && request.body.isVendor === false) {

      return response.status(HTTP_BAD_REQUEST).json('Party should either vendor, or customer or both.');

    }
    await party.save();
    return response.status(HTTP_OK).json(party);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const updateParty = async(request: any, response: any) => {

  try {

    const {id} = request.params;
    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.companyCode) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const Party = PartyModel.createModel(sessionDetails.companyCode);

    const party = await Party.findById(id);

    const updateObject: PartyS = request.body;
    const expectedObject = Object.assign(party, updateObject);
    await PartyUtil.validateParty(expectedObject, sessionDetails);

    await Party.updateOne({_id: id}, updateObject, { runValidators: true });
    return response.status(HTTP_OK).json(updateObject);

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

const deleteParty = async(request: any, response: any) => {

  try {

    const {id} = request.params;
    const sessionDetails = AuthUtil.findSessionDetails(request);
    if (!sessionDetails.companyCode) {

      return response.status(HTTP_UNAUTHORIZED).json('Permission denied.');

    }
    const Party = PartyModel.createModel(sessionDetails.companyCode);
    const resp = await Party.deleteOne({_id: id});
    if (resp.deletedCount === 0) {

      return response.status(HTTP_BAD_REQUEST).send('No party is deleted.');

    }

    return response.status(HTTP_OK).json('Party deleted successfully.');

  } catch (error) {

    return response.status(HTTP_BAD_REQUEST).send(error);

  }

};

router.route('/').get(passport.authenticate('user-jwt', { session: false}), listParty);
router.route('/:id').get(passport.authenticate('user-jwt', { session: false}), getParty);
router.route('/').post(passport.authenticate('user-jwt', { session: false}), bodyParser.json(), saveParty);
router.route('/:id').put(passport.authenticate('user-jwt', { session: false}), bodyParser.json(), updateParty);
router.route('/:id')['delete'](passport.authenticate('user-jwt', { session: false}), deleteParty);

export default router;
