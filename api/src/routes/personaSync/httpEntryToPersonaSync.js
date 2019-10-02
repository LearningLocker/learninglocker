// @ts-check
import { Request, Response } from 'express';

/**
 * @param {Request} req
 */
async function constructPersonaSyncRequest(req) {
  return validate({
    name: optionalString,
    identifiers: requiredNonEmptyArray(either([
      {
        key: 'account',
        value: {
          name: requiredString,
          homePage: requiredUrl,
        },
      },
      {
        key: either(['mbox', 'mbox_sha1sum', 'openid']),
        value: requiredString,
      },
    ])),
    attributes: requiredDictionary(string, either([string, number, boolean, null])),
  }, req.body);
}

/**
 * @param {Request} req
 * @param {Response} res
 */
export function httpEntryToPersonaSync(req, res) {
  // Authenticate.

  // Validate.
  const personaSyncRequest = constructPersonaSyncRequest(req);

  // Process.
  const storedIdentifiers = await upsertIdentifiers(personaSyncRequest.identifiers);
  const personaId = await usePersonaIdFromIdentifiers(storedIdentifiers); // use first or create.
  await upsertAttributes(personaId, personaSyncRequest.attributes);
  await assignIdentifiers(personaId, storedIdentifiers);

  // Respond.
  res.sendStatus(204);
}
