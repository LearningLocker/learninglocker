import { fromJS } from 'immutable';
import { expect } from 'chai';
import {
  COLUMN_IFI_KEY,
  COLUMN_IFI_VALUE,
  COLUMN_ATTRIBUTE_DATA_KEY,
  COLUMN_ATTRIBUTE_DATA,
  COLUMN_ACCOUNT_KEY,
  COLUMN_ACCOUNT_VALUE,
  COLUMN_MBOX,
  COLUMN_MBOXSHA1SUM,
  COLUMN_NAME,
  COLUMN_FIRST_NAME,
  COLUMN_LAST_NAME,
  COLUMN_NOTHING,
} from 'lib/constants/personasImport';
import {
  resetRelatedStructure,
  updateRelatedStructure,
  getPossibleRelatedColumns,
  getPersonaName,
  getIfis,
  getAttributes,
  getPrimaryMaxPlusOne,
  getAccountHomePageColumns,
} from './personasImportHelpers';

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

  describe('getAccountHomePageColumns', () => {
    it('should get columnNames whose columnType are COLUMN_ACCOUNT_KEY', () => {
      const structure = fromJS({
        test1: {
          columnType: COLUMN_ACCOUNT_VALUE,
        },
        test2: {
          columnType: COLUMN_ACCOUNT_KEY,
        },
        test3: {
          columnType: COLUMN_NOTHING,
        },
        test4: {
          columnType: COLUMN_MBOX,
        },
      });

      const actual = getAccountHomePageColumns(structure);
      const expected = ['test2', 'test3', 'test4'];
      expect(actual).to.deep.equal(expected);
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
          columnType: COLUMN_ATTRIBUTE_DATA
        }
      };

      const result = getPossibleRelatedColumns({
        structure,
        columnType: COLUMN_ATTRIBUTE_DATA_KEY
      });

      expect(result.length).to.equal(0);
    });

    it('should get related columns from data', () => {
      const structure = {
        test1: {
          columnType: COLUMN_ATTRIBUTE_DATA_KEY
        }
      };

      const result = getPossibleRelatedColumns({
        structure,
        columnType: COLUMN_ATTRIBUTE_DATA
      });

      expect(result.length).to.equal(0);
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
    it('should get first and last name', () => {
      const structure = {
        test1: {
          columnType: COLUMN_LAST_NAME
        },
        test2: {
          columnType: COLUMN_FIRST_NAME
        }
      };

      const result1 = getPersonaName({ structure, row: { test1: 'aaa ', test2: 'bbb' } });
      expect(result1).to.equal('bbb aaa');

      const result2 = getPersonaName({ structure, row: { test1: ' aaa', test2: '' } });
      expect(result2).to.equal('aaa');

      const result3 = getPersonaName({ structure, row: { test1: ' ', test2: ' bbb ' } });
      expect(result3).to.equal('bbb');

      const result4 = getPersonaName({ structure, row: { test1: '', test2: '' } });
      expect(result4).to.equal(undefined);

      const result5 = getPersonaName({ structure, row: { test1: '', test2: ' ' } });
      expect(result5).to.equal(undefined);

      const result6 = getPersonaName({ structure, row: { test1: '  ', test2: ' ' } });
      expect(result6).to.equal(undefined);
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
          relatedColumn: 'test4'
        },
        test4: {
          columnType: COLUMN_ACCOUNT_VALUE,
          primary: 1,
          relatedColumn: 'test3'
        },
        test5: {
          columnType: COLUMN_ACCOUNT_VALUE,
          primary: 3,
          useConstant: true,
          constant: 'http://hi'
        }
      };

      const row = {
        test1: 'dave',
        test2: 'dave@test.com',
        test3: 'http://dave.com',
        test4: 'dave dot com',
        test5: 'dave'
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

      expect(result[2].key).to.equal('account');
      expect(result[2].value.name).to.equal('dave');
      expect(result[2].value.homePage).to.equal('http://hi');

      expect(result.length).to.equal(3);
    });

    it('should add mailto to mbox', () => {
      const structure = {
        test1: {
          columnType: COLUMN_NAME
        },
        test2: {
          columnType: COLUMN_MBOX,
          primary: 1
        }
      };

      const row = {
        test1: 'dave',
        test2: 'dave@test.com'
      };

      const result = getIfis({
        structure,
        row
      });
      expect(result[0].value).to.equal('mailto:dave@test.com');
    });

    it('should ignore account unset rows', () => {
      const structure = {
        'First HomePage': {
          columnName: 'First HomePage',
          columnType: COLUMN_ACCOUNT_KEY,
          relatedColumn: 'First ID',
          primary: 1
        },
        'First ID': {
          columnName: 'First ID',
          columnType: COLUMN_ACCOUNT_VALUE,
          relatedColumn: 'Firest HomePage',
          primary: null
        },
        'Second HomePage': {
          columnName: 'Second HomePage',
          columnType: COLUMN_ACCOUNT_KEY,
          relatedColumn: 'Second ID',
          primary: 2
        },
        'Second ID': {
          columnName: 'Second ID',
          columnType: COLUMN_ACCOUNT_VALUE,
          relatedColumn: 'Second HomePage',
          primary: null
        },
      };

      const row = {
        'First HomePage': 'https://example.org/1',
        'First ID': '',
        'Second HomePage': 'https://example.org/2',
        'Second ID': '321cba',
      };

      const result = getIfis({
        structure,
        row
      });
      expect(result.length).to.equal(1);
      expect(result[0].key).to.equal('account');
      expect(result[0].value.name).to.equal('321cba');
      expect(result[0].value.homePage).to.equal('https://example.org/2');
    });

    it('should ignore unset rows', () => {
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
      };

      const row = {
        test1: '',
        test2: undefined,
      };

      const result = getIfis({
        structure,
        row
      });

      expect(result.length).to.equal(0);
    });
  });
  describe('getAttributes', () => {
    it('should get attributes with no related column', () => {
      const structure = {
        test1: {
          columnType: COLUMN_ATTRIBUTE_DATA,
          relatedColumn: ''
        }
      };

      const row = {
        test1: 'brown'
      };

      const result = getAttributes({
        structure,
        row
      });
      expect(result.length).to.equal(1);
      expect(result[0].key).to.equal('test1');
      expect(result[0].value).to.equal('brown');
    });

    it('should get attributes with a related column', () => {
      const structure = {
        test1: {
          columnType: COLUMN_ATTRIBUTE_DATA_KEY,
          relatedColumn: 'test2'
        },
        test2: {
          columnType: COLUMN_ATTRIBUTE_DATA,
          relatedColumn: 'test1'
        }
      };
      const row = {
        test1: 'hairColour',
        test2: 'brown'
      };

      const result = getAttributes({
        structure,
        row
      });
      expect(result.length).to.equal(1);
      expect(result[0].key).to.equal('hairColour');
      expect(result[0].value).to.equal('brown');
    });
  });
  describe('getPrimaryMaxPlusOne', () => {
    it('should get max primary', () => {
      const structure = fromJS({
        test1: {},
        test2: {
          primary: 2
        },
        test3: {
          primary: 1
        }
      });

      const result = getPrimaryMaxPlusOne({ structure });
      expect(result).to.equal(2);
    });
  });
});
