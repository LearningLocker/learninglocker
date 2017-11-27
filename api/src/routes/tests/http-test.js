import { expect } from 'chai';
import supertestApi from 'lib/connections/supertestApi';
import * as routes from 'lib/constants/routes';
import { getConnection } from 'lib/connections/mongoose';
import { createUserJWT } from 'api/auth/jwt';
import Statement from 'lib/models/statement';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import testId from 'api/routes/tests/utils/testId';
import DBHelper from './DBHelper';


const connection = getConnection();
const apiApp = supertestApi();

const db = new DBHelper();

let statement;
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

  describe('statement routes', () => {
    describe('Call on statements/aggregation', () => {
      beforeEach('create organisation and jwt token', async () => {
        orgJwtToken = await createOrgToken(['ALL'], [], '561a679c0c5d017e4004714e');

        statement = await Statement.create({
          organisation: testId,
          statement: {
            context: {
              extensions: {
                'http://example&46;org': 'testing'
              }
            }
          }
        });

        console.log(statement);
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
  });

  describe('GET organisations', () => {
    it('should GET all organisations', (done) => {
      apiApp
        .get(`${routes.RESTIFY_PREFIX}/organisation`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200, done);
    });
  });
});
