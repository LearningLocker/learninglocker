import Lrs from 'lib/models/lrs';
import wrapHandlerForStatement from 'worker/handlers/statement/wrapHandlerForStatement';
import { STATEMENT_LRSCOUNT_QUEUE } from 'lib/constants/statements';

export default wrapHandlerForStatement(STATEMENT_LRSCOUNT_QUEUE, (statement, done) => {
  if (statement) {
    Lrs.findByIdAndUpdate(statement.lrs_id, { $inc: { statementCount: 1 } }, done);
  }
});
