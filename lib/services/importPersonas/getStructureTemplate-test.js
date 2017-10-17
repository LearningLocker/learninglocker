/* eslint-disable no-unused-expressions */
import PersonasImport from 'lib/models/personasImport';
import { expect } from 'chai';
import {
  COLUMN_NAME,
  COLUMN_ATTRIBUTE_DATA
} from 'lib/constants/personasImport';
import getStructureTemplate from './getStructureTemplate';

describe('getStructureTemplate', () => {
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
    await PersonasImport.remove({});

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
    await PersonasImport.remove({});
  });

  it('should get the structure template where one exists', async () => {
    const result = await getStructureTemplate([
      'test1', 'test2'
    ]);

    expect(result).to.deep.equal(structure1);
  });

  it('should return undefined when no templates exist', async () => {
    const result = await getStructureTemplate([
      'test1', 'test3'
    ]);

    expect(result).to.be.undefined;
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

    const result = await getStructureTemplate([
      'test1', 'test2', 'test3'
    ]);

    expect(result).to.deep.equal(structure);
  });
});
