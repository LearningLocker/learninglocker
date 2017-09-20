import { isString } from 'lodash';
import remove$out from 'lib/helpers/remove$out';
import remove$oid from 'lib/helpers/remove$oid';
import remove$dte from 'lib/helpers/remove$dte';
import convert$personaIdent from 'lib/helpers/convert$personaIdent';

export default pipeline => Promise.resolve().then(() => {
  let parsedPipeline;
  if (isString(pipeline)) parsedPipeline = JSON.parse(pipeline);
  else parsedPipeline = pipeline;

  parsedPipeline = remove$oid(parsedPipeline);
  parsedPipeline = remove$dte(parsedPipeline);
  parsedPipeline = remove$out(parsedPipeline);
  return parsedPipeline;
})
.then(parsedPipeline => convert$personaIdent(parsedPipeline))
.catch(err => err);
