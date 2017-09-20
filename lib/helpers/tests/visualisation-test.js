import { expect } from 'chai';
import { unflattenAxes, deserialiseAxes } from 'lib/helpers/visualisation';
import { fromJS } from 'immutable';
import { VISUALISE_AXES_PREFIX } from 'lib/constants/visualise';

describe('visualisation helpers test', () => {
  describe('unflattenAxes', () => {
    it('should unflattenAxes', () => {
      const in1 = fromJS({
        axesyLabel: 'Y-axes',
        axesyValue: '{"test": "testValue"}',
        otherValue: 'otherValue'
      });

      const out = unflattenAxes(in1);

      expect(out.toJS().yLabel).to.equal('Y-axes');
      expect(out.toJS().yValue).to.equal('{"test": "testValue"}');
      expect(out.toJS().otherValue).to.be.an('undefined');
    });
  });
  describe('deserialiseAxes', () => {
    it('should deserialise the axes', () => {
      const in1 = fromJS({
        axesyLabel: 'Y-axes',
        axesgroup: '{"test1": "test2"}',
        axesxValue: '{"test3": "test4"}',
        axesyValue: '{"test5": "test6"}',
        axesvalue: '{"test7": "test8"}',
        axesyQuery: '{"test9": "test10"}',
        axesxQuery: '{"test11": "test12"}',
        axesquery: '{"test13": "test14"}',
        other: '{"test15": "test16"}'
      });

      const out = deserialiseAxes(in1);

      expect(out.getIn(['axesyLabel'])).to.equal('Y-axes');
      expect(out.getIn(['axesgroup', 'test1'])).to.equal('test2');
      expect(out.getIn(['axesxValue', 'test3'])).to.equal('test4');
      expect(out.getIn(['axesyValue', 'test5'])).to.equal('test6');
      expect(out.getIn(['axesvalue', 'test7'])).to.equal('test8');
      expect(out.getIn(['axesyQuery', 'test9'])).to.equal('test10');
      expect(out.getIn(['axesxQuery', 'test11'])).to.equal('test12');
      expect(out.getIn(['axesquery', 'test13'])).to.equal('test14');
      expect(out.getIn(['other'])).to.equal('{"test15": "test16"}');
    });

    it('should deserialise the axes with prefix', () => {
      const in1 = fromJS({
        yLabel: 'Y-axes',
        group: '{"test1": "test2"}',
        xValue: '{"test3": "test4"}',
        yValue: '{"test5": "test6"}',
        value: '{"test7": "test8"}',
        yQuery: '{"test9": "test10"}',
        xQuery: '{"test11": "test12"}',
        query: '{"test13": "test14"}',
        other: '{"test15": "test16"}'
      });

      const out = deserialiseAxes(in1, VISUALISE_AXES_PREFIX);

      expect(out.getIn(['yLabel'])).to.equal('Y-axes');
      expect(out.getIn(['group', 'test1'])).to.equal('test2');
      expect(out.getIn(['xValue', 'test3'])).to.equal('test4');
      expect(out.getIn(['yValue', 'test5'])).to.equal('test6');
      expect(out.getIn(['value', 'test7'])).to.equal('test8');
      expect(out.getIn(['yQuery', 'test9'])).to.equal('test10');
      expect(out.getIn(['xQuery', 'test11'])).to.equal('test12');
      expect(out.getIn(['query', 'test13'])).to.equal('test14');
      expect(out.getIn(['other'])).to.equal('{"test15": "test16"}');
    });
  });
});
