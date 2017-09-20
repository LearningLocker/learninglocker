import { get, post, patch, del, form } from 'popsicle';
import mapValues from 'lodash/mapValues';
import { activeTokenSelector } from 'ui/redux/modules/auth';
import * as routes from 'lib/constants/routes';
import config from 'ui/config';

function formatUrl(path) {
  const adjustedPath = path[0] !== '/' ? `/${path}` : path;
  if (__SERVER__) {
    // Prepend host and port of the API server to the path.
    return `http://${config.apiHost}:${config.apiPort}${adjustedPath}`;
  }
  // Prepend `/api` to relative URL, to proxy to API server.
  return `/api${adjustedPath}`;
}

class _LLApiClient {
  constructor(req) {
    this.req = req;
  }

  setStore = (store) => {
    this.store = store;
  }

  getToken = () => {
    const state = this.store.getState();
    const activeToken = activeTokenSelector(state);
    return activeToken;
  }

  constructRequest = (schema, query = {}, props = {}, body = null) => {
    const url = formatUrl(`${routes.RESTIFY_PREFIX}/${schema}${props._id ? `/${props._id}` : ''}`);
    const data = {
      url,
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      }
    };

    data.query = mapValues(query, JSON.stringify);

    if (body) {
      data.body = body;
    }

    return data;
  }

  indexModels = (schema, filter, params, limit = 0) => {
    switch (schema) {
      case 'statement': return get({
        url: formatUrl('/statements/aggregate'),
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        },
        query: {
          skip: limit,
          pipeline: JSON.stringify(filter),
          cache: true,
        }
      });

      default: {
        const query = {
          query: filter,
          skip: limit,
          ...params
        };
        const indexData = this.constructRequest(schema, query);

        // stringify JSON for request
        return get(indexData);
      }
    }
  }

  getModel = (schema, id) => get({
    url: formatUrl(`${routes.RESTIFY_PREFIX}/${schema}/${id}`),
    headers: {
      Authorization: `Bearer ${this.getToken()}`
    },
  })

  countModels = (schema, filter, params) => get({
    url: (schema === 'statement') ?
      formatUrl('/statements/count') : formatUrl(
        `${routes.RESTIFY_PREFIX}/${schema}/count`
      ),
    headers: {
      Authorization: `Bearer ${this.getToken()}`
    },
    query: {
      query: JSON.stringify(filter),
      ...params
    }
  });

  getConnection = ({ schema, filter, sort, cursor, first, last }) => {
    const queryParams = {
      filter: JSON.stringify(filter),
      sort: JSON.stringify(sort),
      ...cursor,
    };

    if (first) queryParams.first = first;
    if (last) queryParams.last = last;

    return get({
      url: formatUrl(`${routes.CONNECTION}/${schema.toLowerCase()}`),
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      },
      query: queryParams
    });
  }

  postModel = (schema, props, params = {}) =>
    post(this.constructRequest(schema, params, props, props))

  patchModel = (schema, props, params) =>
    patch(this.constructRequest(schema, params, props, props))

  deleteModel = (schema, props, params) =>
    del(this.constructRequest(schema, params, props, props))

  getAppData = key => get({
    url: formatUrl(`/app/${key}`),
  })

  getAggregation = (pipeline, limit) => get({
    url: formatUrl('/statements/aggregate'),
    headers: {
      Authorization: `Bearer ${this.getToken()}`
    },
    query: {
      pipeline: JSON.stringify(pipeline),
      skip: limit,
      cache: true,
    }
  })

  peopleUpload = (file, owner) => {
    const peopleForm = form({
      users: file,
      userId: owner
    });
    return post({
      url: formatUrl('/uploadpeople'),
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        ContentType: 'multipart/form-data; boundary=,',
        Accept: 'text/csv'
      },
      body: peopleForm
    });
  }

  uploadLogo = (file, id) => {
    const logoForm = form({
      logo: file
    });
    return post({
      url: formatUrl('/uploadlogo'),
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        ContentType: 'multipart/form-data; boundary=,',
        Accept: 'image/jpg, image/png,image/*;q=0.8,*/*;q=0.5'
      },
      body: logoForm,
      query: {
        data: id
      }
    });
  }

  downloadExport = ({ exportId, pipelines }) => get({
    url: formatUrl('/export'),
    headers: {
      Authorization: `Bearer ${this.getToken()}`
    },
    query: { exportId, pipelines: JSON.stringify(pipelines) }
  });

  mergePersona = (mergePersonaFromId, mergePersonaToId) => post({
    url: formatUrl(routes.MERGE_PERSONA),
    headers: {
      Authorization: `Bearer ${this.getToken()}`
    },
    query: {
      mergePersonaFromId,
      mergePersonaToId,
    }
  });

  assignPersona = (personaId, personaIdentifierId) => post({
    url: formatUrl(routes.ASSIGN_PERSONA),
    headers: {
      Authorization: `Bearer ${this.getToken()}`
    },
    query: {
      personaId,
      personaIdentifierId,
    }
  });

  createPersonaFromIdentifier = personaIdentifierId => post({
    url: formatUrl(routes.CREATE_PERSONA_FROM_IDENTIFIER),
    headers: {
      Authorization: `Bearer ${this.getToken()}`
    },
    query: {
      personaIdentifierId,
    }
  });
}

const LLApiClient = _LLApiClient;
export default LLApiClient;
