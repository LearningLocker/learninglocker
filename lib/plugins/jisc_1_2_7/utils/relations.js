import _ from 'lodash';

export const updateForeignSingular = (foreignModel, localModel, removeRelation, query, foreignKey, done) => {
  const actualQuery = removeRelation ? { [foreignKey]: localModel._id } : query;
  const setValue = removeRelation ? null : localModel._id;
  foreignModel.update(actualQuery, {
    $set: {
      [foreignKey]: setValue // the value passed in on $unset is irrelevant
    }
  }, { multi: true }, done);
};

export const updateForeignMultiple = (foreignModel, localModel, removeRelation, query, foreignKey, done) => {
  const operator = removeRelation ? '$pull' : '$addToSet';
  const actualQuery = removeRelation ? { [foreignKey]: { $in: [localModel._id] } } : query;
  foreignModel.update(actualQuery, {
    [operator]: {
      [foreignKey]: localModel._id
    }
  }, { multi: true }, done);
};

export const updateLocalSingular = (foreignModel, localModel, query, localKey, done) => {
  foreignModel.findOne(query, (err, model) => {
    if (err) return done(err);
    localModel[localKey] = _.get(model, '_id', null);
    done();
  });
};

export const updateLocalMultiple = (foreignModel, localModel, query, localKey, done) => {
  foreignModel.find(query, (err, models) => {
    if (err) return done(err);
    if (models.length === 0) return done();

    const modelIds = _.map(models, '_id');
    localModel[localKey] = _.uniqBy([...localModel[localKey], ...modelIds], _.toString);
    return done();
  });
};
