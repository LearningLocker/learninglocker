import { modelToCursor } from 'lib/models/plugins/addCRUDFunctions';
import sinon from 'sinon';
import { expect } from 'chai';
import { fromCursor /* , toCursor */ } from 'lib/helpers/cursor';
import { receiveChange } from 'lib/models/plugins/addWSFunctions';

describe('addWsFunctions-test', () => {
  let mockWs; // tslint:disable-line:no-let
  let fakeSend;
  beforeEach(() => {
    fakeSend = sinon.fake();
    mockWs = {
      send: fakeSend
    };
  });

  describe('recieveChange', () => {

    it('should to end', () => {
      const sort = { id: -1 };
      let cursorHistory = []; // eslint-disable-line prefer-const
      const change = { _id: '2' };

      receiveChange({
        ws: mockWs,
        cursorHistory,
        sort
      })(change);

      expect(cursorHistory.length).to.equal(1);
    });

    it('should set correct cursor', () => {
      const sort = { _id: -1 };
      const cursorHistory = ['1', '3', '6', '9', '11'].map(
        id => modelToCursor({ _id: id }, sort)
      );


      const change = {
        _id: '2'
      };

      receiveChange({
        ws: mockWs,
        cursorHistory,
        sort,
      })(change);

      expect(fakeSend.callCount).to.equal(1);
      expect(cursorHistory.length).to.equal(6);

      const result = JSON.parse(fakeSend.lastArg);

      expect(fromCursor(result.before)).to.deep.equal({ _id: '1' });

      console.log('002', fromCursor(result.before));
    });
  });
});
