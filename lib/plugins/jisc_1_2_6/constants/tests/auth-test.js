// ./node_modules/mocha/bin/mocha lib/plugins/jisc_1_2_6/constants/tests/auth-test.js -r tests.babel

import sinon from 'sinon';
import httpMocks from 'node-mocks-http';
import { assert } from 'chai';
import * as auth from 'lib/plugins/jisc_1_2_6/constants/auth';
import Student from 'lib/plugins/jisc_1_2_6/models/student';
import * as scopes from 'lib/constants/scopes';

describe('test the outputFn method on JISC_DEFAULTS', () => {
  it('should call on getAllowedFieldsByScope', (done) => {
    const req = httpMocks.createRequest({
      statusCode: 200,
      erm: {
        model: Student
      },
      user: {
        scopes: [scopes.ALL]
      }
    });
    const res = httpMocks.createResponse();

    sinon.spy(req.erm.model, 'getAllowedFieldsByScope');

    auth.JISC_DEFAULTS.outputFn(req, res);

    assert(req.erm.model.getAllowedFieldsByScope.calledOnce, 'getAllowedFieldsByScope was not called');
    assert(req.erm.model.getAllowedFieldsByScope.calledWith(req.user.scopes), 'getAllowedFieldsByScope was not called with the correct scopes');
    done();
  });
});
