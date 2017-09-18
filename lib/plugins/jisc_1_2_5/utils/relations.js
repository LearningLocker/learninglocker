import _ from 'lodash';

export const updateForeignSingular = (foreignModel, localModel, query, foreignKey, done) => {
  foreignModel.update(query, {
    $set: {
      [foreignKey]: localModel._id
    }
  }, done);
};

export const updateForeignMultiple = (foreignModel, localModel, query, foreignKey, done) => {
  foreignModel.update(query, {
    $addToSet: {
      [foreignKey]: localModel._id
    }
  }, done);
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
