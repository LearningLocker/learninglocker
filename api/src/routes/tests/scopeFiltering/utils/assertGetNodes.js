import * as assert from 'assert';

export default (apiApp, modelName) => (token, nodes) =>
  apiApp
    .get(`/connection/${modelName}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/i)
    .expect((res) => {
      assert.equal(res.body.edges.length, nodes, res.body);
    });
