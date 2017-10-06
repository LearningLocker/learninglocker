import { expect } from 'chai';
import {
  COLUMN_AGENT_DATA,
  COLUMN_MBOX,
  COLUMN_AGENT_DATA_KEY
} from 'lib/constants/personasImport';
import {
  validateNoMutipleBindings,
  validateIsBound
} from './personasImport';

describe('personasImport model', () => {
  describe('validate structure', () => {
    describe('validateNoMutipleBindings', () => {
      it('should not allow dupliacte related columnts', () => {
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
    });

    describe.only('validateIsBound', () => {
      it('if related is optional, no binding is needed', () => {
        const structure = {
          test1: {
            columnType: COLUMN_AGENT_DATA
          }
        };

        const result = validateIsBound(structure);
        expect(result).to.equal(false);
      });

      it('if related is optional and incorrect binding is provided', () => {
        const structure = {
          test1: {
            columnType: COLUMN_AGENT_DATA,
            relatedColumn: 'test2'
          },
          test2: {
            columnType: COLUMN_MBOX,
            relatedColumn: 'test1'
          }
        };

        const result = validateIsBound(structure);
        expect(result[0]).to.equal('test1 is bound to test2 but test2 is of an invalid type');
      });

      it('if related is bound to an invalid type', () => {
        const structure = {
          test1: {
            columnType: COLUMN_AGENT_DATA
          },
          test2: {
            columnType: COLUMN_MBOX,
            relatedColumn: 'test1'
          }
        };

        const result = validateIsBound(structure);
        expect(result[0]).to.equal('test2 is related to test1 but COLUMN_MBOX should have no relation');
      });

      it('if related bindings do not match up', () => {
        const structure = {
          test1: {
            columnType: COLUMN_AGENT_DATA,
            relatedColumn: 'test2'
          },
          test2: {
            columnType: COLUMN_AGENT_DATA_KEY,
            relatedColumn: 'test3'
          },
          test3: {
            columnType: COLUMN_AGENT_DATA,
            relatedColumn: 'test2'
          },
        };

        const result = validateIsBound(structure);
        expect(result[0]).to.equal('test1 is bound to test2 but test2 is not bound to test1');
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

      it('should succeed', () => {
        const structure = {
          test1: {
            columnType: COLUMN_AGENT_DATA,
            relatedColumn: 'test2'
          },
          test2: {
            columnType: COLUMN_AGENT_DATA_KEY,
            relatedColumn: 'test1'
          },
          test3: {
            columntType: COLUMN_MBOX
          }
        };

        const result = validateIsBound(structure);
        console.log('result', result);
        expect(result).to.equal(false);
      });
    });
  });
});
