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
  let out = await filter$lookup(out);
  out = await convert$personaIdent(parsedPipeline, options);
  return out;
})
.catch(err => err);
