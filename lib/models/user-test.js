import { expect } from 'chai';
import { schema as userSchema } from './user';
import { get, includes } from 'lodash';

describe('user', () => {
  it('Fields should be private by default', () => {
    const nonPrivateFields = [
      'name',
      'email',
      'organisations',
      'organisationSettings',
      'imageUrl',
      'googleId',
      'ownerOrganisation',
      'ownerOrganisationSettings.LOCKOUT_ENABLED',
      'ownerOrganisationSettings.LOCKOUT_ATTEMPS',
      'ownerOrganisationSettings.LOCKOUT_SECONDS',
      'ownerOrganisationSettings.PASSWORD_HISTORY_CHECK',
      'ownerOrganisationSettings.PASSWORD_HISTORY_TOTAL',
      'ownerOrganisationSettings.PASSWORD_MIN_LENGTH',
      'ownerOrganisationSettings.PASSWORD_REQUIRE_ALPHA',
      'ownerOrganisationSettings.PASSWORD_REQUIRE_NUMBER',
      'ownerOrganisationSettings.PASSWORD_USE_CUSTOM_REGEX',
      'ownerOrganisationSettings.PASSWORD_CUSTOM_REGEX',
      'ownerOrganisationSettings.PASSWORD_CUSTOM_MESSAGE',
      'settings.CONFIRM_BEFORE_DELETE',
      'scopes',
      'verified',
      'authLastAttempt',
      'authFailedAttempts',
      'authLockoutExpiry',
      '_id',
      'updatedAt',
      'createdAt',
      '__v'
    ];
    let count = 0;
    userSchema.eachPath((pathName, schemaType) => {
      if (includes(nonPrivateFields, pathName)) {
        return;
      }
      expect(get(schemaType, ['options', 'access'])).to.equal('private');
      count += 1;
    });

    expect(count).to.equal(3);
  });
});
