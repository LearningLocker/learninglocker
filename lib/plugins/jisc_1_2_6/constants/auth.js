import { RESTIFY_DEFAULTS } from 'lib/constants/auth';
import _ from 'lodash';
import boolean from 'boolean';
import logger from 'lib/logger';
import { VERSION } from 'lib/plugins/jisc_1_2_6/constants/settings';

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

const jiscPreDelete = (req, res, next) => {
  const model = req.erm.document;
  // check if we are bypassing the softdeletes entirely
  const forceDelete = boolean(_.get(req, 'query.force', false));
  if (!forceDelete && model.schema.softDeletes) {
    model.softDeleteHandler((err) => {
      if (err) {
        logger.error(err);
        res.status(500).send({ error: 'There was an error trying to soft delete this model', message: err.toString() });
      } else {
        res.sendStatus(204);
      }
    });
  } else {
    return next();
  }
};

export const JISC_DEFAULTS = _.defaultsDeep({
  version: `/v${VERSION}`,
  totalCountHeader: true,
  // remove all fields that the client is not allowed to see
  outputFn: filterOutput,

  // stop fields being modified if the client doesn't have access
  preUpdate,
  preCreate: preUpdate,
  findOneAndRemove: false,
  preDelete: function handlePreDelete(req, res, next) {
    if (RESTIFY_DEFAULTS.preDelete) {
      RESTIFY_DEFAULTS.preDelete(req, res, () => {
        jiscPreDelete(req, res, next);
      });
    } else {
      jiscPreDelete(req, res, next);
    }
  }
}, RESTIFY_DEFAULTS);
