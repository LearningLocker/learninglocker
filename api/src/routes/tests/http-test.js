import { expect } from 'chai';
import moment from 'moment';
import * as routes from 'lib/constants/routes';
import supertestApi from 'lib/connections/supertestApi';
import { getConnection } from 'lib/connections/mongoose';
import * as redis from 'lib/connections/redis';
import Statement from 'lib/models/statement';
import delay from 'lib/helpers/delay';
import { createUserJWT } from 'api/auth/jwt';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import testId from 'api/routes/tests/utils/testId';
import DBHelper from './DBHelper';


const connection = getConnection();
const apiApp = supertestApi();
const redisClient = redis.createClient();

const db = new DBHelper();

let jwtToken;
let orgJwtToken;
const provider = 'native';

describe('API HTTP Route tests', function describeTest() {
  this.timeout(10000);
  before((done) => {
    if (connection.readyState !== 1) {
      connection.on('connected', () => {
        done();
      });
    } else {
      done();
    }
  });

  beforeEach('Set up organisation and users for testing', (done) => {
    db.prepare(async (err) => {
      if (err) return done(err);
      try {
        const token = await createUserJWT(db.user, provider);
        jwtToken = token;
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  afterEach('Clear db collections', (done) => {
    db.cleanUp(done);
  });

  describe('Auth routes', () => {
    describe('Try and request a new password', () => {
      it('Should find the user using email and send them an email', (done) => {
        apiApp
          .post(routes.AUTH_RESETPASSWORD_REQUEST)
          .send({ email: db.user.email })
          .expect(204, done);
      });
    });

    describe('Get auth client info', () => {
      it('should return the clients organisation and scope', (done) => {
        apiApp
          .get(routes.AUTH_CLIENT_INFO)
          .auth(db.client.api.basic_key, db.client.api.basic_secret)
          .expect('Content-Type', /json/)
          .expect((res) => {
            expect(res.body.title).to.equal(db.client.title);
            expect(res.body.organisation).to.equal(
              db.client.organisation.toString()
            );
            expect(res.body.scopes.length).to.equal(db.client.scopes.length);
            expect(res.body.scopes[0]).to.equal(db.client.scopes[0]);
          })
          .expect(200, done);
      });
    });
  });

  describe('Try and reset password using a token', () => {
    it('Should find the user using token and email and change their user password', (done) => {
      db.user.createResetToken((token) => {
        db.user.resetTokens.push(token);
        db.user.save((err) => {
          if (err) return done(err);

          apiApp
            .post(routes.AUTH_RESETPASSWORD_RESET)
            .send({
              email: db.user.email,
              token: token.token,
              password: 'mynewpassword999'
            })
            .expect(200)
            .end((err) => {
              if (err) return done(err);
              expect(err).to.equal(null);

              const User = getConnection().model('User');
              User.findOne({ _id: db.user.id }, (finderr, user) => {
                expect(user.password).to.not.equal(db.user.password);
                done();
              });
            });
        });
      });
    });
  });

  describe('statement routes', () => {
    describe('Call on statements/aggregate', () => {
      beforeEach('create organisation and jwt token', async () => {
        orgJwtToken = await createOrgToken(['ALL'], [], '561a679c0c5d017e4004714e');

        await Statement.create({
          organisation: testId,
          statement: {
            context: {
              extensions: {
                'http://example&46;org': 'testing'
              }
            }
          }
        });
      });

      it('should return 200 with token auth', async () => {
        const { body } = await apiApp
          .get(`${routes.STATEMENTS_AGGREGATE}?pipeline=[]`)
          .set('Authorization', `Bearer ${orgJwtToken}`)
          .expect(200);

        expect(body).to.have.lengthOf(1);
        expect(body[0].statement).to.deep.equal({
          context: {
            extensions: {
              'http://example.org': 'testing'
            }
          }
        });
      });

      it('should return 200 with clientBasic auth', (done) => {
        apiApp
          .get(`${routes.STATEMENTS_AGGREGATE}?pipeline=[]`)
          .auth(db.client.api.basic_key, db.client.api.basic_secret)
          .expect(200, done);
      });
    });

    describe('Call on statements/aggregateAsync', () => {
      beforeEach('create organisation and jwt token', async () => {
        orgJwtToken = await createOrgToken(['ALL'], [], '561a679c0c5d017e4004714e');

        await Statement.create({
          organisation: testId,
          statement: {
            context: {
              extensions: {
                'http://example&46;org': 'testing'
              }
            }
          }
        });

        // Clear async aggregation cache
        const keys = await redisClient.keys('*-AGGREGATION-ASYNC-*');
        for (const k of keys) {
          await redisClient.del(k);
        }
      });

      it('should return empty result and status when no cache', async () => {
        const datetime1 = moment();

        const { body } = await apiApp
          .get(`${routes.STATEMENTS_AGGREGATE_ASYNC}?pipeline=[]`)
          .set('Authorization', `Bearer ${orgJwtToken}`)
          .expect(200);

        const datetime2 = moment();

        expect(body.result).to.equal(null);
        expect(body.status.completedAt).to.equal(null);
        expect(moment(body.status.startedAt).isSameOrAfter(datetime1)).to.equal(true);
        expect(moment(body.status.startedAt).isSameOrBefore(datetime2)).to.equal(true);
      });

      it('should return status with startedAt and status on second request', async () => {
        const datetime1 = moment();

        // 1st request
        await apiApp
          .get(`${routes.STATEMENTS_AGGREGATE_ASYNC}?pipeline=[]`)
          .set('Authorization', `Bearer ${orgJwtToken}`)
          .expect(200);

        const datetime2 = moment();

        // 2nd request
        const { body } = await apiApp
          .get(`${routes.STATEMENTS_AGGREGATE_ASYNC}?pipeline=[]`)
          .set('Authorization', `Bearer ${orgJwtToken}`)
          .expect(200);

        expect(moment(body.status.startedAt).isSameOrAfter(datetime1)).to.equal(true);
        expect(moment(body.status.startedAt).isSameOrBefore(datetime2)).to.equal(true);
      });

      it('should return status with startedAt and status on second request', async () => {
        const datetime1 = moment();

        // 1st request
        await apiApp
          .get(`${routes.STATEMENTS_AGGREGATE_ASYNC}?pipeline=[]`)
          .set('Authorization', `Bearer ${orgJwtToken}`)
          .expect(200);

        // This 1000 msec is irresponsible,
        // but 1000 msec is expected to be enough that aggregation is done.
        await delay(1000);

        const datetime2 = moment();

        // 2nd request
        const { body } = await apiApp
          .get(`${routes.STATEMENTS_AGGREGATE_ASYNC}?pipeline=[]`)
          .set('Authorization', `Bearer ${orgJwtToken}`)
          .expect(200);

        expect(moment(body.status.completedAt).isSameOrAfter(datetime1)).to.equal(true);
        expect(moment(body.status.completedAt).isSameOrBefore(datetime2)).to.equal(true);

        expect(body.result).to.be.an('array');
        expect(body.result.length).to.be.above(0);
      });

      it('should return empty result and status on second request with different query', async () => {
        // 1st request
        await apiApp
          .get(`${routes.STATEMENTS_AGGREGATE_ASYNC}?pipeline=[]`)
          .set('Authorization', `Bearer ${orgJwtToken}`)
          .expect(200);

        const datetime1 = moment();

        // 2nd request with another query
        const { body } = await apiApp
          .get(`${routes.STATEMENTS_AGGREGATE_ASYNC}?pipeline=[]&skip=1`)
          .set('Authorization', `Bearer ${orgJwtToken}`)
          .expect(200);

        const datetime2 = moment();

        expect(body.result).to.equal(null);
        expect(body.status.completedAt).to.equal(null);
        expect(moment(body.status.startedAt).isSameOrAfter(datetime1)).to.equal(true);
        expect(moment(body.status.startedAt).isSameOrBefore(datetime2)).to.equal(true);
      });
    });
  });

  describe('GET organisations', () => {
    it('should GET all organisations', (done) => {
      apiApp
        .get(`${routes.RESTIFY_PREFIX}/organisation`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200, done);
    });
  });

  describe('oauth/token', () => {
    it('should return 404 when request method is GET', (done) => {
      apiApp
        .get(routes.OAUTH2_TOKEN)
        .expect(404, done);
    });

    it('should return 200 when all parameters are valid', (done) => {
      apiApp
        .post(routes.OAUTH2_TOKEN)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          grant_type: 'client_credentials',
          client_id: db.client.api.basic_key,
          client_secret: db.client.api.basic_secret
        })
        .expect(200, done);
    });

    it('should return 400 when client_id is invalid', (done) => {
      apiApp
        .post(routes.OAUTH2_TOKEN)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          grant_type: 'client_credentials',
          client_id: `${db.client.api.basic_key}_`,
          client_secret: db.client.api.basic_secret
        })
        .expect(400, done);
    });

    it('should return 400 when client_secret is invalid', (done) => {
      apiApp
        .post(routes.OAUTH2_TOKEN)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          grant_type: 'client_credentials',
          client_id: db.client.api.basic_key,
          client_secret: `${db.client.api.basic_secret}_`
        })
        .expect(400, done);
    });
  });
});
