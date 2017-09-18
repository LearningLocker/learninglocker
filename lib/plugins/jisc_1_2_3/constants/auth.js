import { RESTIFY_DEFAULTS } from 'lib/constants/auth';
import _ from 'lodash';
import { VERSION } from 'lib/plugins/jisc_1_2_3/constants/settings';

const addOrganisationToBody = (organisation, body) => {
  if (_.isArray(body)) {
    return _.map(body, (model) => {
      model.organisation = organisation;
      return model;
    });
  }
  return {
    ...body,
    organisation
  };
};

export const filterFields = (allowedFields, body) => {
  if (_.isArray(body)) {
    return _.map(body, model => _.pick(model, allowedFields));
  }
  return _.pick(body, allowedFields);
};


const filterOutput = (req, res) => {
  const { scopes } = req.user;
  const { result, statusCode, model } = req.erm;
  const allowedFields = model.getAllowedFieldsByScope(scopes);
  res.status(statusCode).json(filterFields(allowedFields, result));
};

/**
 * Removes fields that a user/client can update through scopes
 */
const updateFieldScoping = (req, res, next) => {
  const { scopes, organisation } = req.user;
  const { model } = req.erm;
  const allowedFields = model.getAllowedFieldsByScope(scopes);
  req.body = filterFields(allowedFields, req.body);
  req.body = addOrganisationToBody(organisation, req.body);
  next();
};

const preUpdate = (req, res, next) => {
  if (RESTIFY_DEFAULTS.preUpdate) {
    // ensure we still call the existing method
    RESTIFY_DEFAULTS.preUpdate(req, res, () => {
      updateFieldScoping(req, res, next);
    });
  } else {
    updateFieldScoping(req, res, next);
  }
};

export const JISC_DEFAULTS = _.defaultsDeep({
  version: `/v${VERSION}`,

  // remove all fields that the client is not allowed to see
  outputFn: filterOutput,

  // stop fields being modified if the client doesn't have access
  preUpdate,
  preCreate: preUpdate,
}, RESTIFY_DEFAULTS);
