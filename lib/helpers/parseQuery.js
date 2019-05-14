import { isString } from 'lodash';
import convert$oid from 'lib/helpers/convert$oid';
import convert$dte from 'lib/helpers/convert$dte';
import convertStatementTimestamp from 'lib/helpers/convertStatementTimestamp';
import remove$out from 'lib/helpers/remove$out';
import convert$personaIdent from 'lib/helpers/convert$personaIdent';
import filter$lookup from 'lib/helpers/filter$lookup';

export default (pipeline, options) => Promise.resolve().then(() => {
  let parsedPipeline;
  if (isString(pipeline)) parsedPipeline = JSON.parse(pipeline);
  else parsedPipeline = pipeline;

  parsedPipeline = convert$oid(parsedPipeline);
  parsedPipeline = convert$dte(parsedPipeline);
  parsedPipeline = convertStatementTimestamp(parsedPipeline);
  parsedPipeline = remove$out(parsedPipeline);

  return parsedPipeline;
})
.then(async (
  parsedPipeline,
  ) => {
  const filteredPipeline = await filter$lookup(parsedPipeline, options.authInfo);
  return await convert$personaIdent(filteredPipeline, options);
})
.catch(err => err);
