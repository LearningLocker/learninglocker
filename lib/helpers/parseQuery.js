import { isString } from 'lodash';
import convert$oid from 'lib/helpers/convert$oid';
import convert$dte from 'lib/helpers/convert$dte';
import convertStatementTimestamp from 'lib/helpers/convertStatementTimestamp';
import remove$out from 'lib/helpers/remove$out';
import convert$personaIdent from 'lib/helpers/convert$personaIdent';

export default pipeline => Promise.resolve().then(() => {
  let parsedPipeline;
  if (isString(pipeline)) parsedPipeline = JSON.parse(pipeline);
  else parsedPipeline = pipeline;

  parsedPipeline = convert$oid(parsedPipeline);
  parsedPipeline = convert$dte(parsedPipeline);
  parsedPipeline = convertStatementTimestamp(parsedPipeline);
  parsedPipeline = remove$out(parsedPipeline);
  return parsedPipeline;
})
.then(parsedPipeline => convert$personaIdent(parsedPipeline))
.catch(err => err);
