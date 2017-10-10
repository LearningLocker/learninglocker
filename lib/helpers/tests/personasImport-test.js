import { fromJS } from 'immutable';
import { expect } from 'chai';
import {
  COLUMN_IFI_KEY,
  COLUMN_IFI_VALUE,
  COLUMN_AGENT_DATA_KEY,
  COLUMN_AGENT_DATA,
  COLUMN_ACCOUNT_KEY,
  COLUMN_ACCOUNT_VALUE,
  COLUMN_MBOX,
  COLUMN_MBOXSHA1SUM,
  COLUMN_NAME
} from 'lib/constants/personasImport';
import {
  resetRelatedStructure,
  updateRelatedStructure,
  getPossibleRelatedColumns,
  hasRelatedField,
  getPersonaName,
  getIfis
} from '../personasImport';

describe('personas import helper', () => {
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
  describe('getPersonaName', () => {
    it('should get persona name', () => {
      const structure = {
        test1: {
          columnType: COLUMN_NAME
        }
      };
      const row = {
        test1: 'dave'
      };

      const result = getPersonaName({
        structure,
        row
      });

      expect(result).to.equal('dave');
    });
    it('should get undefined persona name', () => {
      const structure = {
        test1: {
          columnType: COLUMN_NAME
        }
      };
      const row = {
      };

      const result = getPersonaName({
        structure,
        row
      });

      expect(result).to.equal(undefined);
    });
  });
  describe('getIfis', () => {
    it('should get ifis', () => {
      const structure = {
        test1: {
          columnType: COLUMN_NAME
        },
        test2: {
          columnType: COLUMN_MBOXSHA1SUM,
          primary: 2
        },
        test3: {
          columnType: COLUMN_ACCOUNT_KEY,
          primary: 1,
          relatedColumn: 'test4'
        },
        test4: {
          columnType: COLUMN_ACCOUNT_VALUE,
          relatedColumn: 'test3'
        },
        test5: {
          columnType: COLUMN_IFI_KEY,
          primary: 3,
          relatedColumn: 'test6'
        },
        test6: {
          columnType: COLUMN_IFI_VALUE,
          relatedColumn: 'test5'
        }
      }

      const row = {
        test1: 'dave',
        test2: 'dave@test.com',
        test3: 'http://dave.com',
        test4: 'dave dot com',
        test5: 'oPeNiD',
        test6: 'theOpenId'
      };

      const result = getIfis({
        structure,
        row
      });

      expect(result[0].value.homePage).to.equal('http://dave.com');
      expect(result[0].key).to.equal('account');
      expect(result[0].value.name).to.equal('dave dot com');

      expect(result[1].key).to.equal('mbox_sha1sum');
      expect(result[1].value).to.equal('dave@test.com');

      expect(result[2].key).to.equal('openid');
      expect(result[2].value).to.equal('theOpenId');
    });
  });
});
