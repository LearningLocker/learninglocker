import { Schema, arrayOf } from 'normalizr';
import { Iterable, Map, List, OrderedMap, fromJS } from 'immutable';
import { includes } from 'lodash';
import mapValues from 'lodash/mapValues';
import isString from 'lodash/isString';
import { deserialiseAxes, axesToJsList } from 'lib/helpers/visualisation';

const defaultReviver = (key, value) => {
  const isIndexed = Iterable.isIndexed(value);
  return isIndexed ? value.toList() : value.toMap();
};

class LLSchema extends Schema {
  constructor(key, props, {
    reviver = defaultReviver,
    validate,
    preSave,
    editableFields
  } = {}) {
    super(key, props);
    this.sortKey = props.sortKey;
    if (validate) {
      this.validate = validate;
    }
    if (reviver) {
      this.reviver = reviver;
    }
    if (preSave) {
      this.preSave = preSave;
    }
    this.editableFields = editableFields || ['name'];
  }

  preSave = model => model

  validate = () => ({
    hasErrors: false,
    messages: {}
  })

  define(props) {
    // prune metadata from props, pass the simpler object to parent normalizr
    this.relations = props;
    const simpleProps = mapValues(props, 'type');
    super.define(simpleProps);
  }
}

const user = new LLSchema('user', { idAttribute: '_id', sortKey: 'updatedAt' }, {
  preSave: model =>
    model.update('organisationSettings', new List(), orgSettings =>
      orgSettings.map(orgSetting =>
        orgSetting.update('filter', new Map({}), filter =>
          (
            filter.size > 0
            ? JSON.stringify(filter.toJS())
            : JSON.stringify(filter)
          )
        )
      )
    ),
  reviver: (key, value) => {
    const isIndexed = Iterable.isIndexed(value); // From default reviver.

    if (key === 'organisationSettings') {
      return value.toList().map((orgSetting) => {
        const filterValue = orgSetting.get('filter', '{}');
        let parsedQuery = {};
        try {
          parsedQuery = JSON.parse(filterValue);
        } catch (e) {
          console.error(e);
        }
        return orgSetting.set('filter', fromJS(parsedQuery));
      });
    }

    return isIndexed ? value.toList() : value.toMap(); // From default reviver.
  }
});
const lrs = new LLSchema('lrs', { idAttribute: '_id', sortKey: 'updatedAt' });
const organisation = new LLSchema('organisation', { idAttribute: '_id', sortKey: 'updatedAt' });
const statement = new LLSchema('statement', { idAttribute: '_id', sortKey: 'timestamp' });

const visualisation = new LLSchema('visualisation', { idAttribute: '_id', sortKey: 'updatedAt' }, {
  preSave: model =>
    model.update('filters',
      fromJS([{ $match: {} }]),
      filters => filters.map(
        query => JSON.stringify(query.toJS())
      )
    ).update('axes', new Map(), axes => JSON.stringify(axes.toJS()))
    .merge(
      model
        .filter((item, key) => key.startsWith('axes') && includes(axesToJsList, key))
        .map(item =>
          JSON.stringify(item ? item.toJS() : null)
        )
    ),

  reviver: (key, value) => {
    const isIndexed = Iterable.isIndexed(value); // From default reviver.

    // Converts projections to a List of OrderedMaps.
    if (key === 'filters') {
      const res = value.map(
        (query) => {
          let parsedQuery = {};
          try {
            parsedQuery = JSON.parse(query);
          } catch (e) {
            console.error(e);
          }
          return fromJS(parsedQuery);
        }
      ).toList();
      return res;
    }

    let out = value.toMap();
    if (isString(value.get('axes'))) {
      out = out.set('axes', fromJS(JSON.parse(value.get('axes'))));
    }

    const out2 = deserialiseAxes(out);

    if (isIndexed) {
      return value.toList();
    }
    return out2;
  }
});

const statementForwarding = new LLSchema(
  'statementForwarding',
  {
    idAttribute: '_id',
    sortKey: 'updatedAt'
  },
  {
    preSave: model => model.update(
      'query',
      fromJS({}),
      query => JSON.stringify(query.toJS())
    ),
    reviver: (key, value) => {
      let out = value.toMap();
      if (isString(value.get('query'))) {
        out = out.set('query', fromJS(JSON.parse(value.get('query'))));
      }

      return out;
    }
  }
);

statementForwarding.define({});

const stream = new LLSchema('stream', { idAttribute: '_id' });
const streamOutcome = new LLSchema('streamOutcome', { idAttribute: '_id' });

const persona = new LLSchema('persona', { idAttribute: '_id', sortKey: 'updatedAt' });
const query = new LLSchema('query', { idAttribute: '_id', sortKey: 'updatedAt' }, {
  preSave: model => model.update('conditions', new Map({}),
    conditions => (conditions.size > 0
      ? JSON.stringify(conditions.toJS())
      : JSON.stringify(conditions)
  ))
});
const identifer = new LLSchema('identifer', { idAttribute: '_id' });
const personaIdentifier = new LLSchema('personaIdentifier', { idAttribute: '_id', sortKey: 'updatedAt' });
const scoredPersonas = new LLSchema('scoredPersonas', { idAttribute: '_id' });
const scoringscheme = new LLSchema('scoringscheme', { idAttribute: '_id', sortKey: 'updatedAt' });
const importcsv = new LLSchema('importcsv', { idAttribute: '_id', sortKey: 'updatedAt' });

const client = new LLSchema('client', { idAttribute: '_id', sortKey: 'updatedAt' }, {
  preSave: model => model.update('authority', authority => (
    Map.isMap(authority) ?
    JSON.stringify(authority.toJS()) :
    undefined
  ))
});

const dashboard = new LLSchema('dashboard', { idAttribute: '_id' }, {
  preSave: model =>
    model.update('filter', new Map({}), filter =>
      (
        filter.size > 0
        ? JSON.stringify(filter.toJS())
        : JSON.stringify(filter)
      )
    ),
  reviver: (key, value) => {
    if (value.has('filter')) {
      try {
        return value.toMap().set('filter', fromJS(JSON.parse(value.get('filter', '{}'))));
      } catch (e) {
        console.error(e);
      }
      return value;
    }

    if (key === 'widgets') return value.toList();

    // From default reviver.
    return Iterable.isIndexed(value) ? value.toList() : value.toMap();
  }
});
const exportSchema = new LLSchema('export', { idAttribute: '_id' }, { // export is a reserved word
  preSave: model => model.update('projections', new List(),
    conditions => conditions.map(condition => JSON.stringify(condition.toJS()))
  ),
  reviver: (key, value) => {
    const isIndexed = Iterable.isIndexed(value); // From default reviver.
    if (key === 'projections') {
      return value.map((projection) => {
        let parsedProjection = {};
        try {
          parsedProjection = JSON.parse(projection);
        } catch (e) {
          console.error(e);
        }
        return new OrderedMap(parsedProjection);
      }).toList();
    }
    return isIndexed ? value.toSet() : value.toMap(); // From default reviver.
  }
});
const download = new LLSchema('download', { idAttribute: '_id' });

const querybuildercache = new LLSchema('querybuildercache', { idAttribute: '_id' });

const querybuildercachevalue = new LLSchema('querybuildercachevalue', { idAttribute: '_id' }, { editableFields: ['value'] });

const aggregation = new LLSchema('aggregation', { idAttribute: model => (
  isString(model._id) ? model._id : JSON.stringify(model._id)
) });

const role = new LLSchema('role', { idAttribute: '_id' });

const globalError = new LLSchema('globalError', { idAttribute: '_id' });

stream.define({
  outcomes: { type: arrayOf(streamOutcome), local: true },
  statements: { type: arrayOf(statement) }
});

user.define({
  organisation: { type: organisation }
});

organisation.define({
  owner: { type: user }
});

lrs.define({
  organisation: { type: organisation }
});

importcsv.define({
  organisation: { type: organisation }
});

statement.define({});

querybuildercache.define({});

querybuildercachevalue.define({});

client.define({
  organisation: { type: organisation },
  lrs_id: { type: lrs }
});

persona.define({
  organisation: { type: organisation },
  personaIdentifiers: { type: arrayOf(personaIdentifier) }
});

personaIdentifier.define({
  organisation: { type: organisation },
  persona: { type: persona },
  scoredPersonas: { type: arrayOf(scoredPersonas), local: true }
});

scoredPersonas.define({
  persona: { type: persona }
});

scoringscheme.define({
  organisation: { type: organisation }
});

visualisation.define({
  organisation: { type: organisation },
  sources: { type: arrayOf(lrs) },
  owner: { type: user },
});

aggregation.define({});

dashboard.define({});

download.define({});

exportSchema.define({
  organisation: { type: organisation },
  downloads: { type: arrayOf(download) }
});

query.define({});

role.define({});

export {
  user,
  lrs,
  organisation,
  statement,
  visualisation,
  stream,
  streamOutcome,
  persona,
  query,
  identifer,
  personaIdentifier,
  scoredPersonas,
  scoringscheme,
  importcsv,
  client,
  dashboard,
  exportSchema as export,
  download,
  querybuildercache,
  querybuildercachevalue,
  aggregation,
  globalError,
  role,
  statementForwarding
};
