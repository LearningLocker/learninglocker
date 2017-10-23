import * as assert from 'assert';

export default (apiApp, modelName) => ({ bearerToken, basicClient, expectedStatus = 200, queryParams = '' }, nodes) => {
  const test = apiApp
    .get(`/connection/${modelName}${queryParams}`);

  if (bearerToken) {
    test.set('Authorization', `Bearer ${bearerToken}`);
  } else if (basicClient) {
    test.auth(basicClient.api.basic_key, basicClient.api.basic_secret);
  }

  test.expect(expectedStatus);
  if (expectedStatus >= 200 && expectedStatus < 300) {
    test
      .expect('Content-Type', /json/i)
      .expect((res) => {
        assert.equal(res.body.edges.length, nodes, res.body);
      });
  }
  return test;
};
