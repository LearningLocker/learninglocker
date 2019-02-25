/* eslint-disable no-unused-expressions */
import PersonasImport from 'lib/models/personasImport';
import { expect } from 'chai';
import {
  COLUMN_NAME,
  COLUMN_ATTRIBUTE_DATA
} from 'lib/constants/personasImport';
import getStructure from './getStructure';

describe('getStructure', () => {
  const structure1 = {
    test1: {
      columnType: COLUMN_NAME
    }
  };
  const structure2 = {
    test4: {
      columnType: COLUMN_NAME
    }
  };
  beforeEach(async () => {
    await PersonasImport.deleteMany({});

    await PersonasImport.create({
      csvHeaders: ['test1', 'test2'],
      structure: structure1
    });

    await PersonasImport.create({
      csvHeaders: ['test4', 'test5'],
      structure: structure2
    });
  });

  after(async() => {
    await PersonasImport.deleteMany({});
  });

  it('should get the structure template where one exists', async () => {
    const result = await getStructure({
      csvHeaders: [
        'test1', 'test2'
      ],
      filter: {}
    });

    expect(result).to.deep.equal({
      ...structure1,
      test2: {
        columnName: 'test2',
        columnType: '',
        primary: null,
        relatedColumn: null,
      }
    });
  });

  it('should return a new structure when no matching structures exist', async () => {
    const result = await getStructure({
      csvHeaders: [
        'test1', 'test3'
      ],
      filter: {}
    });

    expect(result).to.deep.equal({
      test1: {
        columnName: 'test1',
        columnType: '',
        primary: null,
        relatedColumn: null,
      },
      test3: {
        columnName: 'test3',
        columnType: '',
        primary: null,
        relatedColumn: null,
      }
    });
  });


  it('should match the most column', async () => {
    const structure = {
      test1: {
        columnType: COLUMN_NAME
      },
      test3: {
        columnType: COLUMN_ATTRIBUTE_DATA
      }
    };

    await PersonasImport.create({
      csvHeaders: ['test1', 'test2', 'test3'],
      structure,
    });

    const result = await getStructure({
      csvHeaders: [
        'test1', 'test2', 'test3'
      ],
      filter: {}
    });

    expect(result).to.deep.equal({
      ...structure,
      test2: {
        columnName: 'test2',
        columnType: '',
        primary: null,
        relatedColumn: null,
      }
    });
  });

  it('should return complete structure', async () => {
    const structure = {
      test1: {
        columnType: COLUMN_NAME
      },
      test2: {
        columnType: COLUMN_ATTRIBUTE_DATA
      }
    };

    await PersonasImport.create({
      csvHeaders: ['test1', 'test2'],
      structure
    });

    const result = await getStructure({
      csvHeaders: [
        'test1', 'test2'
      ],
      filter: {}
    });

    expect(result).to.deep.equal(structure);
  });
});
