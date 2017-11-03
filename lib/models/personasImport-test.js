import { expect } from 'chai';
import {
  COLUMN_ATTRIBUTE_DATA,
  COLUMN_MBOX,
  COLUMN_ATTRIBUTE_DATA_KEY,
  COLUMN_NAME
} from 'lib/constants/personasImport';
import {
  validateNoMutipleBindings,
  validateIsBound,
  validatePrimaryUnique,
  validatePrimaryNumber,
  validateOneName
} from './personasImport';

describe('personasImport model', () => {
  describe('validate structure', () => {
    describe('validateNoMutipleBindings', () => {
      it('should not allow duplicate related columnts', () => {
        const structure = {
          test1: {

          },
          test2: {
            relatedColumn: 'test1'
          },
          test3: {
            relatedColumn: 'test1'
          }
        };

        const result = validateNoMutipleBindings(structure);
        expect(result.length).to.equal(1);

        expect(result[0]).to.equal('test1 is bound multiple times');
      });

      it('should succeed', () => {
        const structure = {
          test1: {

          },
          test2: {
            relatedColumn: 'test1'
          }
        };

        const result = validateNoMutipleBindings(structure);
        expect(result).to.equal(false);
      });

      it('should succeed if multiple relateColumns are unset', () => {
        const structure = {
          test1: {

          },
          test2: {

          }
        };

        const result = validateNoMutipleBindings(structure);
        expect(result).to.equal(false);
      });
    });

    describe('validateIsBound', () => {
      it('if related is optional, no binding is needed', () => {
        const structure = {
          test1: {
            columnType: COLUMN_ATTRIBUTE_DATA
          }
        };

        const result = validateIsBound(structure);
        expect(result).to.equal(false);
      });

      it('if related is bound to an invalid type', () => {
        const structure = {
          test1: {
            columnType: COLUMN_ATTRIBUTE_DATA
          },
          test2: {
            columnType: COLUMN_MBOX,
            relatedColumn: 'test1'
          }
        };

        const result = validateIsBound(structure);
        expect(result[0]).to.equal('test2 is related to test1 but COLUMN_MBOX should have no relation');
      });

      it('if type does not have a relation', () => {
        const structure = {
          test1: {
            columnType: COLUMN_MBOX,
            relatedColumn: 'test2'
          }
        };

        const result = validateIsBound(structure);
        expect(result[0]).to.equal('test1 is related to test2 but COLUMN_MBOX should have no relation');
      });
    });

    describe('validatePrimaryUnique', () => {
      it('should fail', () => {
        const structure = {
          test1: {
            primary: 1
          },
          test2: {
            primary: 1
          }
        };

        const result = validatePrimaryUnique(structure);

        expect(result).to.equal(false);
      });

      it('should succeed', () => {
        const structure = {
          test1: {
            primary: 1
          },
          test2: {
            primary: 2
          },
          test3: {}
        };

        const result = validatePrimaryUnique(structure);

        expect(result).to.equal(true);
      });

      it('should succeed with dupliacte null', () => {
        const structure = {
          test1: {
            primary: 1,
          },
          test2: {
            primary: null
          },
          test3: {
            primary: null
          }
        };

        const result = validatePrimaryUnique(structure);
        expect(result).to.equal(true);
      });
    });

    describe('validatePrimaryNumber', () => {
      it('should suceed', () => {
        const structure = {
          test1: {
            primary: 1
          },
          test2: {

          }
        };

        const result = validatePrimaryNumber(structure);
        expect(result).to.equal(true);
      });

      it('should fail if number is not an intereger', () => {
        const structure = {
          test1: {
            primary: 0.5
          }
        };

        const result = validatePrimaryNumber(structure);
        expect(result).to.equal(false);
      });
    });

    describe('validateOneName', () => {
      it('should have one name', () => {
        const structure = {
          test1: {
            columnType: COLUMN_NAME
          }
        };

        const result = validateOneName(structure);

        expect(result).to.equal(true);
      });

      it('should not have more than one name', () => {
        const structure = {
          test1: {
            columnType: COLUMN_NAME
          },
          test2: {
            columnType: COLUMN_NAME
          }
        };

        const result = validateOneName(structure);

        expect(result).to.equal(false);
      });
    });
  });
});
