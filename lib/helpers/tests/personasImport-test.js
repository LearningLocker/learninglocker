import { fromJS } from 'immutable';
import { expect } from 'chai';
import {
  COLUMN_IFI_KEY,
  COLUMN_IFI_VALUE,
  COLUMN_AGENT_DATA_KEY,
  COLUMN_AGENT_DATA,
  COLUMN_ACCOUNT_KEY,
  COLUMN_ACCOUNT_VALUE,
  COLUMN_MBOX
} from 'lib/constants/personasImport';
import {
  resetRelatedStructure,
  updateRelatedStructure,
  getPossibleRelatedColumns,
  hasRelatedField
} from '../personasImport';

describe.only('personas import helper', () => {
  describe('resetRelatedStructure', () => {
    it('should reset the structure', () => {
      const structure = fromJS({
        test1: {
          relatedColumn: 'test2'
        },
        test2: {
          relatedColumn: 'test1'
        },
        test3: {
          relatedColumn: 'test2'
        }
      });

      const result = resetRelatedStructure({
        structure,
        columnName: 'test1'
      });

      expect(result.getIn(['test1', 'relatedColumn'])).to.equal('');
      expect(result.getIn(['test2', 'relatedColumn'])).to.equal('');
      expect(result.getIn(['test3', 'relatedColumn'])).to.equal('test2');
    });
  });

  describe('updateRelatedStructure', () => {
    it('should update all related', () => {
      const structure = fromJS({
        test1: {
          columnType: COLUMN_IFI_KEY,
        },
        test2: {
          columnType: COLUMN_IFI_VALUE,
          relatedColumn: 'test3'
        },
        test3: {
          columnType: COLUMN_IFI_VALUE,
          relatedColumn: 'test2'
        }
      });

      const result = updateRelatedStructure({
        structure,
        columnName: 'test1',
        relatedColumn: 'test2'
      });

      expect(result.getIn(['test1', 'relatedColumn'])).to.equal('test2');
      expect(result.getIn(['test2', 'relatedColumn'])).to.equal('test1');
      expect(result.getIn(['test3', 'relatedColumn'])).to.equal('');
    });

    it('should update all related with dependent', () => {
      const structure = fromJS({
        test1: {
          columnType: COLUMN_IFI_KEY,
          relatedColumn: 'test3'
        },
        test2: {
          columnType: COLUMN_IFI_VALUE,
        },
        test3: {
          columnType: COLUMN_IFI_VALUE,
          relatedColumn: 'test1'
        }
      });

      const result = updateRelatedStructure({
        structure,
        columnName: 'test1',
        relatedColumn: 'test2'
      });

      expect(result.getIn(['test1', 'relatedColumn'])).to.equal('test2');
      expect(result.getIn(['test2', 'relatedColumn'])).to.equal('test1');
      expect(result.getIn(['test3', 'relatedColumn'])).to.equal('');
    });
  });

  describe('getPossibleRelatedColumns', () => {
    it('should get relate columns from key', () => {
      const structure = {
        test1: {
          columnType: COLUMN_AGENT_DATA
        }
      };

      const result = getPossibleRelatedColumns({
        structure,
        columnType: COLUMN_AGENT_DATA_KEY
      });

      expect(result[0]).to.equal('test1');
      expect(result.length).to.equal(1);
    });

    it('should get related columns from data', () => {
      const structure = {
        test1: {
          columnType: COLUMN_AGENT_DATA_KEY
        }
      };

      const result = getPossibleRelatedColumns({
        structure,
        columnType: COLUMN_AGENT_DATA
      });

      expect(result[0]).to.equal(''); // Can just use the csv heading as heading as key
      expect(result[1]).to.equal('test1');
      expect(result.length).to.equal(2);
    });
  });

  describe('hasRelatedField', () => {
    it('should not have related field', () => {
      const result = hasRelatedField(COLUMN_MBOX);

      expect(result).to.equal(false);
    });

    it('should have related field key', () => {
      const result = hasRelatedField(COLUMN_ACCOUNT_KEY);
      expect(result).to.equal(true);
    });

    it('should have related field data', () => {
      const result = hasRelatedField(COLUMN_ACCOUNT_VALUE);
      expect(result).to.equal(true);
    });
  });
});
