import mongoose from 'mongoose';
import {
  get,
  has,
  head,
  tail,
  isString,
  filter,
  isObject,
  find
} from 'lodash';
import { map } from 'bluebird';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getFileAndFieldsFromRequest from 'api/controllers/utils/getFileAndFieldsFromRequest';
import getPersonaService from 'lib/connections/personaService';
import uploadPersonasService from 'lib/services/importPersonas/uploadPersonas';
import importPersonasService from 'lib/services/importPersonas/importPersonas';
import { downloadToStream } from 'lib/services/files';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import PersonasImport from 'lib/models/personasImport';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import reasignPersonaStatements from 'lib/services/persona/reasignPersonaStatements';
import updateQueryBuilderCache from 'lib/services/importPersonas/updateQueryBuilderCache';
import { validateIfis } from 'lib/services/persona/validateIfi';

const objectId = mongoose.Types.ObjectId;

const uploadPersonas = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);
  const { file, fields: { id } } = await getFileAndFieldsFromRequest(req);

  const personasImport = await uploadPersonasService({
    id,
    file,
    authInfo
  });

  return res.status(200).json(personasImport);
});

const importPersonas = catchErrors(async (req, res) => {
  const { id } = req.body;
  const authInfo = getAuthFromRequest(req);
  const personaService = getPersonaService();

  const { personaImport } = await importPersonasService({
    id,
    authInfo,
    personaService,
  });

  res.status(200).json(personaImport);
});

const importPersonasError = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const id = req.params.id;

  const scopeFilter = await getScopeFilter({
    modelName: 'personasImport',
    actionName: 'view',
    authInfo
  });

  const personaImport = await PersonasImport.findOne({
    _id: objectId(id),
    ...scopeFilter
  });

  const csvHandle = personaImport.csvErrorHandle || personaImport.csvHandle;

  res.header('Content-Type', 'text/csv');
  return downloadToStream(csvHandle)(res);
});

/**
 * body
 * {
 *    personaName:
 *    ifi: {
 *      key: 'mbox' || 'mbox_sha1sum' || 'openid' || 'account'
 *      value: string || {
 *        homePage: string,
 *        name: string
 *      }
 *    },
 *    ifis: [
 *      {
 *        key: 'mbox' || 'mbox_sha1sum' || 'openid' || 'account'
 *        value: string || {
 *          homePage: string,
 *          name: string
 *        }
 *      },
 *    ],
 *    attrbutes: [
 *      {
 *      }
 *    ]
 * }
 */
const uploadJsonPersona = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const personaService = getPersonaService();
  const organisation = getOrgFromAuthInfo(authInfo);

  const ifis = filter([req.body.ifi, ...req.body.ifis], isObject);

  validateIfis(ifis, ['ifi']);

  const personaName = req.body.personaName;

  const personaIdentifiers = await map(ifis, (ifi) => {
    const out = personaService.createUpdateIdentifierPersona({
      organisation,
      personaName,
      ifi
    });
    return out;
  });

  const personaIds = await map(personaIdentifiers, ({ personaId }) => personaId);
  const toPersonaId = head(personaIds);
  const fromPersonaIds = tail(personaIds);
  if (personaName && isString(personaName) && personaName.length > 0) {
    // update the persona to have the new name
    // upsert to ensure that the persona is made if has been removed since
    await personaService.updatePersona({
      organisation,
      personaId: toPersonaId,
      name: personaName,
      upsert: true
    });
  }

  // Merge personas
  await map(fromPersonaIds, (fromPersonaId) => {
    if (toPersonaId === fromPersonaId) {
      // Do nothing, as the ifi already points to this persona.
      return;
    }

    return Promise.all([
      personaService.mergePersona({
        organisation,
        toPersonaId,
        fromPersonaId
      }),
      reasignPersonaStatements({
        organisation,
        fromId: fromPersonaId,
        toId: toPersonaId
      })
    ]);
  });

  const inputAttributes = filter([req.body.attribute, ...(req.body.attributes || [])], isObject);

  const attributes = filter(inputAttributes, inputAttribute => has(inputAttribute, 'key') && has(inputAttribute, 'value'));

  await map(attributes, (attribute) => {
    if (!has(attribute, 'key') || !has(attribute, 'value')) {
      return;
    }
    return personaService.overwritePersonaAttribute({
      personaId: toPersonaId,
      organisation,
      key: get(attribute, 'key'),
      value: get(attribute, 'value')
    });
  });

  await updateQueryBuilderCache({
    attributes,
    organisation
  });

  const merged = !find(personaIdentifiers, ({ wasCreated }) => wasCreated);

  return res.status(200).json({
    merged
  });
});

export default {
  uploadPersonas,
  importPersonas,
  importPersonasError,
  uploadJsonPersona
};
