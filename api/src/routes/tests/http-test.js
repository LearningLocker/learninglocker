import { expect } from 'chai';
import supertestApi from 'lib/connections/supertestApi';
import * as routes from 'lib/constants/routes';
import { getConnection } from 'lib/connections/mongoose';
import { createOrgJWT, createUserJWT } from 'api/auth/jwt';
import DBHelper from './DBHelper';

const connection = getConnection();
const apiApp = supertestApi();

const db = new DBHelper();

let jwtToken;
let orgJwtToken;
const provider = 'native';

describe('API HTTP Route tests', () => {
  before((done) => {
    console.log('readyState', connection.readyState);
    if (connection.readyState !== 1) {
      connection.on('connected', () => {
        console.log('connected');
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

  describe.skip('statement routes', () => {
    describe('Call on statements/aggregation', () => {
      it('should return 200 with token auth', (done) => {
        apiApp
          .get(routes.STATEMENTS_AGGREGATE)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200, done);
      });

      it('should return 200 with clientBasic auth', (done) => {
        apiApp
          .get(routes.STATEMENTS_AGGREGATE)
          .auth(db.client.api.basic_key, db.client.api.basic_secret)
          .expect(200, done);
      });
    });
  });

  describe('GET organisations', () => {
    before('create organisation and jwt token', async () => {
      orgJwtToken = await createOrgJWT(
        db.user,
        db.user.organisations[0],
        provider
      );
    });

    it.skip('should get all statements in the org', (done) => {
      apiApp
        .get(`${routes.RESTIFY_PREFIX}/organisation`)
        .set('Authorization', `Bearer ${orgJwtToken}`)
        .expect(200, done);
    });
  });
});
