import { expect } from 'chai';
import jsonwebtoken from 'jsonwebtoken';
import moment from 'moment';
import { delay } from 'bluebird';
import * as routes from 'lib/constants/routes';
import supertestApi from 'lib/connections/supertestApi';
import { getConnection } from 'lib/connections/mongoose';
import Statement from 'lib/models/statement';
import { createUserJWT } from 'api/auth/jwt';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import testId from 'api/routes/tests/utils/testId';
import DBHelper from './DBHelper';


const connection = getConnection();
const apiApp = supertestApi();

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

  describe('/api/auth/jwt/password', () => {
    it('should return 200 and user access token when valid password', async () => {
      await apiApp
        .post(routes.AUTH_JWT_PASSWORD)
        .auth('testy@mctestface.com', 'password1')
        .expect(200)
        .expect('Content-Type', /text\/plain/)
        .expect((res) => {
          // Test cookie (refresh token)
          expect(res.headers['set-cookie'].length).to.equal(1);
          const refreshTokenCookie = res.headers['set-cookie'][0].split('; ').reduce((acc, kv) => {
            const [k, v] = kv.split('=');
            return { ...acc, [k]: v };
          }, {});

          expect(refreshTokenCookie.Path).to.equal(`/api${routes.AUTH_JWT_REFRESH}`);
          expect(Object.keys(refreshTokenCookie).includes('HttpOnly')).to.equal(true);

          expect(moment(refreshTokenCookie.Expires).isBefore(moment().add(7, 'days'))).to.equal(true);
          expect(moment(refreshTokenCookie.Expires).isAfter(moment().add(7, 'days').add(-3, 's'))).to.equal(true);

          const refreshToken = refreshTokenCookie.refresh_token_user_561a679c0c5d017e4004714f;
          const decodedRefreshToken = jsonwebtoken.verify(refreshToken, process.env.APP_SECRET);

          expect(decodedRefreshToken.userId).to.equal('561a679c0c5d017e4004714f');
          expect(decodedRefreshToken.tokenType).to.equal('user_refresh');
          expect(moment.unix(decodedRefreshToken.exp).isBefore(moment().add(7, 'days'))).to.equal(true);
          expect(moment.unix(decodedRefreshToken.exp).isAfter(moment().add(7, 'days').add(-3, 's'))).to.equal(true);

          // Test body (access token)
          const decodedAccessToken = jsonwebtoken.verify(res.text, process.env.APP_SECRET);
          expect(decodedAccessToken.userId).to.equal('561a679c0c5d017e4004714f');
          expect(decodedAccessToken.tokenType).to.equal('user');
          expect(decodedAccessToken.tokenId).to.equal('561a679c0c5d017e4004714f');

          expect(moment.unix(decodedAccessToken.exp).isBefore(moment().add(1, 'h'))).to.equal(true);
          expect(moment.unix(decodedAccessToken.exp).isAfter(moment().add(1, 'h').add(-3, 's'))).to.equal(true);
        });
    });

    it('should return 401 when invalid password', async () => {
      await apiApp
        .post(routes.AUTH_JWT_PASSWORD)
        .auth('testy@mctestface.com', 'invalid_password')
        .expect(401)
        .expect((res) => {
          expect(res.headers['set-cookie']).to.equal(undefined);
        });
    });
  });

  describe('/api/auth/jwt/organisation', () => {
    it('should return 200 when user access token is valid', async () => {
      let userAccessToken = '';

      await apiApp
        .post(routes.AUTH_JWT_PASSWORD)
        .auth('testy@mctestface.com', 'password1')
        .expect((res) => {
          userAccessToken = res.text;
        });

      await apiApp
        .post(routes.AUTH_JWT_ORGANISATION)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          organisation: '561a679c0c5d017e4004714f',
        })
        .expect(200)
        .expect((res) => {
          // Test cookie (refresh token)
          expect(res.headers['set-cookie'].length).to.equal(1);
          const refreshTokenCookie = res.headers['set-cookie'][0].split('; ').reduce((acc, kv) => {
            const [k, v] = kv.split('=');
            return { ...acc, [k]: v };
          }, {});

          expect(refreshTokenCookie.Path).to.equal(`/api${routes.AUTH_JWT_REFRESH}`);
          expect(Object.keys(refreshTokenCookie).includes('HttpOnly')).to.equal(true);

          expect(moment(refreshTokenCookie.Expires).isBefore(moment().add(7, 'days'))).to.equal(true);
          expect(moment(refreshTokenCookie.Expires).isAfter(moment().add(7, 'days').add(-3, 's'))).to.equal(true);

          const refreshToken = refreshTokenCookie.refresh_token_organisation_561a679c0c5d017e4004714f;
          const decodedRefreshToken = jsonwebtoken.verify(refreshToken, process.env.APP_SECRET);

          expect(decodedRefreshToken.userId).to.equal('561a679c0c5d017e4004714f');
          expect(decodedRefreshToken.tokenId).to.equal('561a679c0c5d017e4004714f');
          expect(decodedRefreshToken.tokenType).to.equal('organisation_refresh');
          expect(moment.unix(decodedRefreshToken.exp).isBefore(moment().add(7, 'days'))).to.equal(true);
          expect(moment.unix(decodedRefreshToken.exp).isAfter(moment().add(7, 'days').add(-3, 's'))).to.equal(true);

          // Test body (access token)
          const decodedAccessToken = jsonwebtoken.verify(res.text, process.env.APP_SECRET);
          expect(decodedAccessToken.userId).to.equal('561a679c0c5d017e4004714f');
          expect(decodedAccessToken.tokenType).to.equal('organisation');
          expect(decodedAccessToken.tokenId).to.equal('561a679c0c5d017e4004714f');

          expect(moment.unix(decodedAccessToken.exp).isBefore(moment().add(1, 'h'))).to.equal(true);
          expect(moment.unix(decodedAccessToken.exp).isAfter(moment().add(1, 'h').add(-3, 's'))).to.equal(true);
        });
    });

    it('should return 401 when user access token is invalid', async () => {
      await apiApp
        .post(routes.AUTH_JWT_ORGANISATION)
        .expect(401)
        .expect((res) => {
          expect(res.headers['set-cookie']).to.equal(undefined);
        });
    });
  });

  describe('/api/auth/jwt/refresh', () => {
    it('should return 200 and user access token when user refresh token cookie is valid', async () => {
      let refreshTokenCookie = '';
      let accessToken = '';

      await apiApp
        .post(routes.AUTH_JWT_PASSWORD)
        .auth('testy@mctestface.com', 'password1')
        .expect((res) => {
          refreshTokenCookie = res.headers['set-cookie'][0];
          accessToken = res.text;
        });

      // To confirm `iat` and `exp` are changed
      await delay(1000);
      refreshTokenCookie = refreshTokenCookie.split('; ')[0];

      await apiApp
        .post(routes.AUTH_JWT_REFRESH)
        .set('Cookie', refreshTokenCookie)
        .send({ id: '561a679c0c5d017e4004714f', tokenType: 'user' })
        .expect(200)
        .expect('Content-Type', /text\/plain/)
        .expect((res) => {
          expect(accessToken).to.not.equal(res.text);
        });
    });

    it('should return 200 and org access token when org refresh token cookie is valid', async () => {
      let userAccessToken = '';
      let orgAccessToken = '';
      let orgRefreshTokenCookie = '';

      await apiApp
        .post(routes.AUTH_JWT_PASSWORD)
        .auth('testy@mctestface.com', 'password1')
        .expect((res) => {
          userAccessToken = res.text;
        });

      await apiApp
        .post(routes.AUTH_JWT_ORGANISATION)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          organisation: '561a679c0c5d017e4004714f',
        })
        .expect((res) => {
          orgRefreshTokenCookie = res.headers['set-cookie'][0];
          orgAccessToken = res.text;
        });

      // To confirm `iat` and `exp` are changed
      await delay(1000);
      orgRefreshTokenCookie = orgRefreshTokenCookie.split('; ')[0];

      await apiApp
        .post(routes.AUTH_JWT_REFRESH)
        .set('Cookie', orgRefreshTokenCookie)
        .send({ id: '561a679c0c5d017e4004714f', tokenType: 'organisation' })
        .expect(200)
        .expect('Content-Type', /text\/plain/)
        .expect((res) => {
          expect(orgAccessToken).to.not.equal(res.text);
        });
    });

    it('should return 401 and user access token when body is incorrect', async () => {
      let refreshTokenCookie = '';

      await apiApp
        .post(routes.AUTH_JWT_PASSWORD)
        .auth('testy@mctestface.com', 'password1')
        .expect((res) => {
          refreshTokenCookie = res.headers['set-cookie'][0];
        });

      // To confirm `iat` and `exp` are changed
      await delay(1000);
      refreshTokenCookie = refreshTokenCookie.split('; ')[0];

      await apiApp
        .post(routes.AUTH_JWT_REFRESH)
        .set('Cookie', refreshTokenCookie)
        .send({ id: '561a679c0c5d017e40040000', tokenType: 'user' })
        .expect(401)
        .expect((res) => {
          expect(res.headers['set-cookie']).to.equal(undefined);
        });
    });

    it('should return 401 when user refresh token cookie is not set', async () => {
      await apiApp
        .post(routes.AUTH_JWT_REFRESH)
        .expect(401)
        .expect((res) => {
          expect(res.headers['set-cookie']).to.equal(undefined);
        });
    });

    it('should return 401 when user refresh token cookie is invalid', async () => {
      let refreshTokenCookie = '';

      await apiApp
        .post(routes.AUTH_JWT_PASSWORD)
        .auth('testy@mctestface.com', 'password1')
        .expect((res) => {
          refreshTokenCookie = res.headers['set-cookie'][0];
        });

      // Falsify the refresh token
      refreshTokenCookie = refreshTokenCookie.split('; ')[0];
      refreshTokenCookie = refreshTokenCookie.slice(0, -4);
      refreshTokenCookie += 'aaaa';

      await apiApp
        .post(routes.AUTH_JWT_REFRESH)
        .set('Cookie', refreshTokenCookie)
        .send({ id: '561a679c0c5d017e4004714f', tokenType: 'user' })
        .expect(401)
        .expect((res) => {
          expect(res.headers['set-cookie']).to.equal(undefined);
        });
    });
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
