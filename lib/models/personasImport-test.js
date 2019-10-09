import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Error } from 'mongoose';
import {
  COLUMN_ATTRIBUTE_DATA,
  COLUMN_MBOX,
  COLUMN_NAME,
  COLUMN_FIRST_NAME,
  COLUMN_LAST_NAME,
} from 'lib/constants/personasImport';
import PersonasImport, {
  validateNoMultipleBindings,
  validateIsBound,
  validatePrimaryUnique,
  validatePrimaryNumber,
  validateOneFullName,
  validateOneFirstName,
  validateOneLastName,
  validateFullNameAndFirstOrLast,
} from './personasImport';

chai.use(chaiAsPromised);

describe('personasImport model', () => {
  describe('validate structure', () => {
    describe('validateNoMultipleBindings', () => {
      it('should not allow duplicate related columns', async () => {
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

        const result = validateNoMultipleBindings(structure);
        expect(result.length).to.equal(1);

        expect(result[0]).to.equal('test1 is bound multiple times');

        const f = PersonasImport.create({ structure });
        await expect(f).to.eventually.be.rejectedWith(Error.ValidationError, 'test1 is bound multiple times');
      });

      it('should succeed', async () => {
        const structure = {
          test1: {

          },
          test2: {
            relatedColumn: 'test1'
          }
        };

        const result = validateNoMultipleBindings(structure);
        expect(result).to.equal(false);

        const f = PersonasImport.create({ structure });
        await expect(f).to.eventually.not.be.rejected;
      });

      it('should succeed if multiple relateColumns are unset', async () => {
        const structure = {
          test1: {

          },
          test2: {

          }
        };

        const result = validateNoMultipleBindings(structure);
        expect(result).to.equal(false);

        const f = PersonasImport.create({ structure });
        await expect(f).to.eventually.not.be.rejected;
      });
    });

    describe('validateIsBound', () => {
      it('if related is optional, no binding is needed', async () => {
        const structure = {
          test1: {
            columnType: COLUMN_ATTRIBUTE_DATA
          }
        };

        const result = validateIsBound(structure);
        expect(result).to.equal(false);

        const f = PersonasImport.create({ structure });
        await expect(f).to.eventually.not.be.rejected;
      });

      it('if related is bound to an invalid type', async () => {
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

        const f = PersonasImport.create({ structure });
        await expect(f).to.eventually.be.rejectedWith(Error.ValidationError, 'test2 is related to test1 but COLUMN_MBOX should have no relation');
      });

      it('if type does not have a relation', async () => {
        const structure = {
          test1: {
            columnType: COLUMN_MBOX,
            relatedColumn: 'test2'
          }
        };

        const result = validateIsBound(structure);
        expect(result[0]).to.equal('test1 is related to test2 but COLUMN_MBOX should have no relation');

        const f = PersonasImport.create({ structure });
        await expect(f).to.eventually.be.rejectedWith(Error.ValidationError, 'test1 is related to test2 but COLUMN_MBOX should have no relation');
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

    describe('validateOneFullName', () => {
      it('should return true if input has 0 full name column', () => {
        const structure = {
          test1: {
            columnType: COLUMN_FIRST_NAME,
          },
        };

        const result = validateOneFullName(structure);
        expect(result).to.equal(true);
      });

      it('should return true if input has 1 full name column', () => {
        const structure = {
          test1: {
            columnType: COLUMN_NAME,
          },
          test2: {
            columnType: COLUMN_LAST_NAME,
          },
        };

        const result = validateOneFullName(structure);
        expect(result).to.equal(true);
      });

      it('should return false if input has multiple full name columns', () => {
        const structure = {
          test1: {
            columnType: COLUMN_NAME,
          },
          test2: {
            columnType: COLUMN_NAME,
          },
        };

        const result = validateOneFullName(structure);
        expect(result).to.equal(false);
      });
    });

    describe('validateOneFirstName', () => {
      it('should return true if input has 0 first name column', () => {
        const structure = {
          test1: {
            columnType: COLUMN_NAME,
          },
        };

        const result = validateOneFirstName(structure);
        expect(result).to.equal(true);
      });

      it('should return true if input has 1 first name column', () => {
        const structure = {
          test1: {
            columnType: COLUMN_LAST_NAME,
          },
          test2: {
            columnType: COLUMN_FIRST_NAME,
          },
        };

        const result = validateOneFirstName(structure);
        expect(result).to.equal(true);
      });

      it('should return false if input has multiple first name columns', () => {
        const structure = {
          test1: {
            columnType: COLUMN_FIRST_NAME,
          },
          test2: {
            columnType: COLUMN_NAME,
          },
          test3: {
            columnType: COLUMN_FIRST_NAME,
          },
        };

        const result = validateOneFirstName(structure);
        expect(result).to.equal(false);
      });
    });

    describe('validateOneLastName', () => {
      it('should return true if input has 0 last name column', () => {
        const structure = {
          test1: {
            columnType: COLUMN_FIRST_NAME,
          },
        };

        const result = validateOneLastName(structure);
        expect(result).to.equal(true);
      });

      it('should return true if input has 1 last name column', () => {
        const structure = {
          test1: {
            columnType: COLUMN_LAST_NAME,
          },
          test2: {
            columnType: COLUMN_FIRST_NAME,
          },
        };

        const result = validateOneLastName(structure);
        expect(result).to.equal(true);
      });

      it('should return false if input has multiple last name columns', () => {
        const structure = {
          test1: {
            columnType: COLUMN_LAST_NAME,
          },
          test2: {
            columnType: COLUMN_LAST_NAME,
          },
          test3: {
            columnType: COLUMN_FIRST_NAME,
          },
        };

        const result = validateOneLastName(structure);
        expect(result).to.equal(false);
      });
    });

    describe('validateFullNameAndFirstOrLast', () => {
      it('should return true if input has 0 full name column', () => {
        const structure = {
          test1: {
            columnType: COLUMN_FIRST_NAME,
          },
          test2: {
            columnType: COLUMN_LAST_NAME,
          },
          test3: {
            columnType: COLUMN_FIRST_NAME,
          },
        };

        const result = validateFullNameAndFirstOrLast(structure);
        expect(result).to.equal(true);
      });

      it('should return true if input has 0 first name and 0 last name', () => {
        const structure = {
          test1: {
            columnType: COLUMN_NAME,
          },
          test2: {
            columnType: COLUMN_NAME,
          },
        };

        const result = validateFullNameAndFirstOrLast(structure);
        expect(result).to.equal(true);
      });

      it('should return false if input has first name and full name', () => {
        const structure = {
          test1: {
            columnType: COLUMN_FIRST_NAME,
          },
          test2: {
            columnType: COLUMN_NAME,
          },
          test3: {
            columnType: COLUMN_NAME,
          },
        };

        const result = validateFullNameAndFirstOrLast(structure);
        expect(result).to.equal(false);
      });

      it('should return false if input has last name and full name', () => {
        const structure = {
          test1: {
            columnType: COLUMN_NAME,
          },
          test2: {
            columnType: COLUMN_LAST_NAME,
          },
          test3: {
            columnType: COLUMN_LAST_NAME,
          },
        };

        const result = validateFullNameAndFirstOrLast(structure);
        expect(result).to.equal(false);
      });
    });
  });
});
