import * as assert from 'assert';

export default (apiApp, modelName, modelId) => ({ bearerToken, basicClient, expectedStatus = 200 }) => {
  const test = apiApp
    .get(`/connection/${modelName}/${modelId.toString()}`);

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
        assert.equal(res.body.edges.length, 1, res.body);
        assert.equal(res.body.edges[0]._id.toString(), modelId.toString());
      });
  }
  return test;
};
