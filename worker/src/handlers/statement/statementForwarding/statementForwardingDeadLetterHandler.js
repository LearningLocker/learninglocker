import Statement from 'lib/models/statement';

const statementForwardingDeadLetterHandler = ({
  statement,
  statementForwarding
}, done) => {
  Statement.findByIdAndUpdate(statement._id, {
    $addToSet: {
      deadForwardingQueue: statementForwarding._id
    },
    $pull: {
      pendingForwardingQueue: statementForwarding._id
    }
  }).then(() => done())
  .catch(err => done(err));
};

export default statementForwardingDeadLetterHandler;
