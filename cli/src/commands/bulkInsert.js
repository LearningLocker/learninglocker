import logger from 'lib/logger';
import TinCan from 'tincanjs';
import faker from 'faker';
import _ from 'lodash';
import moment from 'moment';
import hash from 'object-hash';
import uuid from 'uuid';

TinCan.DEBUG = false;

let lrs;
let _batchSize;
const ACCOUNT = 'account';
const MBOX = 'mbox';
const actorTypes = [ACCOUNT, MBOX];
let contextActivities;
const registrations = {};


function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function makeActor() {
  const type = actorTypes[Math.floor(Math.random() * actorTypes.length)];
  const actor = {
    name: faker.fake('{{name.firstName}} {{name.lastName}}')
  };

  switch (type) {
    default:
    case ACCOUNT:
      actor.account = {
        name: actor.name.split(' ').join('.').toLowerCase(),
        homePage: faker.internet.url()
      };
      break;
    case MBOX:
      actor.mbox = `${actor.name.split(' ').join('.').toLowerCase()}@gmail.com`;
      break;
  }

  return actor;
}

function makeVerb() {
  let buzz = faker.company.bsBuzz();
  buzz = buzz.concat((buzz.slice(-1) === 'e') ? 'd' : 'ed');

  return {
    id: `http://fak.er/verb/${buzz.split(' ').join('-')}`,
    display: {
      'en-GB': buzz
    }
  };
}

function makeObject() {
  const buzzNoun = faker.company.bsNoun();
  return {
    objectType: 'Activity',
    id: `http://fak.er/object/${buzzNoun.split(' ').join('-')}`,
    definition: {
      name: {
        'en-GB': buzzNoun
      }
    }
  };
}

function createLRS(host, user, pwd) {
  return new TinCan.LRS({
    endpoint: host,
    username: user,
    password: pwd,
    allowFail: true
  });
}

function populateEntities(count, makeEntity) {
  const entities = [];
  const weights = [];
  const normalizedWeights = [];

  let remainingWeight = 1;
  let sum = 0;
  for (let i = 0; i < count; i += 1) {
    const thisWeight = (i === count - 1)
      ? remainingWeight // if this is the last actor give them all the remaining weight
      : rand(0, Math.min(0.2, remainingWeight)); // give each actor at most 20% of the statements

    sum += thisWeight;
    remainingWeight -= thisWeight;

    entities.push(makeEntity());
    weights.push(thisWeight);
    normalizedWeights.push(sum);
  }

  for (let i = 0; i < count; i += 1) {
    normalizedWeights[i] /= sum;
  }

  return { entities, weights, normalizedWeights };
}

function getWeightedRandomIndex(normalizedWeights) {
  const needle = Math.random();
  let high = normalizedWeights.length - 1;
  let low = 0;
  let probe = 0;

  while (low < high) {
    probe = Math.ceil((high + low) / 2);

    if (normalizedWeights[probe] < needle) {
      low = probe + 1;
    } else if (normalizedWeights[probe] > needle) {
      high = probe - 1;
    } else {
      return probe;
    }
  }

  if (low !== high) {
    return (normalizedWeights[low] >= needle) ? low : probe;
  }
  return (normalizedWeights[low] >= needle) ? low : low + 1;
}

function addRandomContext(data, actors, probability = 0.25) {
  const contextData = {};

  // add registration
  if (Math.random() <= probability) {
    const registrationHash = hash({ actor: data.actor, target: data.target });
    if (!_.has(registrations, registrationHash)) {
      registrations[registrationHash] = uuid.v4();
    }
    contextData.registration = registrations[registrationHash];
  }

  // add instructor
  if (Math.random() <= probability) {
    contextData.instructor = actors.entities[getWeightedRandomIndex(actors.normalizedWeights)];
  }

  const domainName = 'http://www.example.com';
  const caData = {};

  // add parent
  if (Math.random() <= probability) {
    caData.parent = contextActivities.entities[getWeightedRandomIndex(contextActivities.normalizedWeights)];
  }
  if (Math.random() <= probability) {
    caData.grouping = contextActivities.entities[getWeightedRandomIndex(contextActivities.normalizedWeights)];
  }
  if (Math.random() <= probability) {
    caData.category = contextActivities.entities[getWeightedRandomIndex(contextActivities.normalizedWeights)];
  }
  if (Math.random() <= probability) {
    caData.other = contextActivities.entities[getWeightedRandomIndex(contextActivities.normalizedWeights)];
  }

  contextData.contextActivities = caData;

  if (Math.random() <= probability) {
    contextData.revision = `${Math.floor(Math.random() * 5) + 1}.${Math.random().toFixed(1)}`;
  }

  if (Math.random() <= probability) {
    contextData.platform = domainName;
  }

  if (Math.random() <= probability) {
    contextData.language = faker.random.arrayElement(['en-GB', 'en-US', 'fr-FR']);
  }

  if (Math.random() <= probability) {
    contextData.extensions = {};
    contextData.extensions[`${domainName}/image`] = faker.image.cats();
    contextData.extensions[`${domainName}/coords`] = {
      longitude: faker.address.longitude(),
      latitude: faker.address.latitude()
    };
  }


  const context = new TinCan.Context(contextData);
  data.context = context;
  return data;
}

function makeBatch(batchSize, actors, verbs, objects, startDate, endDate) {
  const statementBatch = [];

  for (let i = 0; i < batchSize; i += 1) {
    const actor = actors.entities[getWeightedRandomIndex(actors.normalizedWeights)];
    const verb = verbs.entities[getWeightedRandomIndex(verbs.normalizedWeights)];
    const target = objects.entities[getWeightedRandomIndex(objects.normalizedWeights)];
    const timestamp = moment.unix(Math.floor(rand(startDate, endDate)));

    let data = {
      actor,
      verb,
      target,
      timestamp
    };


    data = addRandomContext(data, actors);

    const statement = new TinCan.Statement(data);

    statementBatch.push(statement);
  }
  return statementBatch;
}

function sendStatements(batchSize, actors, verbs, objects, callback, startDate, endDate) {
  logger.info(`Sending batch of ${batchSize}`);
  const statements = makeBatch(batchSize, actors, verbs, objects, startDate, endDate);

  const cfg = {
    callback: (err, xhr) => {
      logger.silly('sendStatements XHR', xhr);
      logger.profile('sendStatements');
      if (!err) {
        // logger.info('XHR', xhr);
        logger.info(`${batchSize} statements sent succesfully`);
        callback();
      } else {
        logger.error(err);
        logger.info(JSON.parse(xhr.response));
        process.exit();
      }
    }
  };

  logger.profile('sendStatements');
  lrs.saveStatements(statements, cfg);
}

function sendBatch(remaining, actors, verbs, objects, startDate, endDate) {
  const thisBatchSize = Math.min(_batchSize, remaining);
  const nextRemaining = remaining - thisBatchSize;
  const callback = nextRemaining > 0 ? sendBatch.bind(null, nextRemaining, actors, verbs, objects, startDate, endDate) : () => {
    logger.info('DONE!');
    process.exit();
  };
  sendStatements(thisBatchSize, actors, verbs, objects, callback, startDate, endDate);
}

export default function (host, user, pwd, total, batchSize) {
  _batchSize = batchSize;
  logger.info('SIZE', batchSize);
  logger.info('TOTAL', total);

  const actors = populateEntities(50, makeActor);
  const verbs = populateEntities(30, makeVerb);
  const objects = populateEntities(70, makeObject);
  contextActivities = populateEntities(5, makeObject);

  try {
    lrs = createLRS(host, user, pwd);
  } catch (err) {
    logger.error('Failed to setup LRS object:', err);
    process.exit();
  }

  const startDate = moment().subtract(3, 'months');
  const endDate = moment();

  sendBatch(total, actors, verbs, objects, startDate.unix(), endDate.unix());
}
