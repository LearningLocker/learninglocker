import PersonasImport from 'lib/models/personasImport';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { STAGE_CONFIGURE_FIELDS } from 'lib/constants/personasImport';
import EmptyCsvError from 'lib/errors/EmptyCsvError';
import uploadPersonas from './uploadPersonas';

chai.use(chaiAsPromised);

describe('import personas', () => {
  afterEach(async () => {
    await PersonasImport.remove({});
  });

  it('upload personas', async () => {
    // const file = fs.readFileSync('./lib/services/importPersonas/__fixtures__/test.csv');
    const file = {
      path: './lib/services/importPersonas/__fixtures__/test.csv'
    };

    const personasImport = await new PersonasImport({
    }).save();

    const result = await uploadPersonas({
      id: personasImport._id,
      file,
      authInfo: {
        token: {
          tokenType: 'organisation',
          scopes: ['EDIT_ALL_PERSONASIMPORT']
        }
      }
    });

    expect(typeof result.csvHandle).to.equal('string');
    expect(result.csvHeaders[0]).to.equal('Test1');
    expect(result.csvHeaders[1]).to.equal('Test2');
    expect(result.csvHeaders.length).to.equal(2);
    expect(result.importStage).to.equal(STAGE_CONFIGURE_FIELDS);
  });

  it('upload personas with empty file', async () => {
    const file = {
      path: './lib/services/importPersonas/__fixtures__/testempty.csv'
    };

    const personasImport = await new PersonasImport({
    }).save();

    const result = uploadPersonas({
      id: personasImport._id,
      file,
      authInfo: {
        token: {
          tokenType: 'organisation',
          scopes: ['EDIT_ALL_PERSONASIMPORT']
        }
      }
    });

    await expect(result).to.eventually.be.rejectedWith(new EmptyCsvError());
  });
});
