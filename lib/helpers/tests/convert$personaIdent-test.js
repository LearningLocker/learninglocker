import testId from 'api/routes/tests/utils/testId';
import getPersonaService from 'lib/connections/personaService';
import convert$personaIdent from 'lib/helpers/convert$personaIdent';
import { expect } from 'chai';
import createDummyOrgAuthInfo from 'lib/helpers/createDummyOrgAuthInfo';

describe('convert$personaIdent', () => {
  const personaService = getPersonaService();

  beforeEach(async () => {
    await personaService.clearService();
  });

  after(async () => {
    await personaService.clearService();
  });

  it('should create a query with attribute', async () => {
    const { persona } = await personaService.createPersona({
      name: 'test',
      organisation: testId,
    });

    await personaService.overwritePersonaAttribute({
      organisation: testId,
      personaId: persona.id,
      key: 'hair',
      value: 'blond'
    });

    const query = {
      $personaIdent: {
        key: 'persona.import.hair',
        value: 'blond'
      }
    };

    const result = await convert$personaIdent(query, {
      authInfo: createDummyOrgAuthInfo(testId)
    });
    expect(result.$in.length).to.equal(1, 'query should have one id');
    expect(result.$in.toString()).to.equal(persona.id, 'query should have id');
  });

  it('should create a query without organisation', async () => {
    const query = {
      $personaIdent: {
        key: 'persona.import.hair',
        value: 'blond'
      }
    };

    const result = await convert$personaIdent(query);

    expect(result.$in.length).to.equal(0);
  });
});
