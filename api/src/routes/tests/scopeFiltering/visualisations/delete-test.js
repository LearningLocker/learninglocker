import mongoose from 'mongoose';

import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import {
  EDIT_ALL_VISUALISATIONS,
  EDIT_PUBLIC_VISUALISATIONS
} from 'lib/constants/orgScopes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
import createOwnerOrgToken
  from 'api/routes/tests/utils/tokens/createOwnerOrgToken';
import setup from 'api/routes/tests/utils/setup';
import { RESTIFY_PREFIX } from 'lib/constants/routes';
import {
  TEST_USER_ID
} from 'lib/services/auth/tests/utils/constants';
import createVisualisation from '../utils/createVisualisation';


const objectId = mongoose.Types.ObjectId;

describe('API HTTP DELETE visualisations route scope filtering', () => {
  const apiApp = setup();

  const assertVisualisation = async({
    isPublic,
    isOwner,
    bearerToken,
    basicToken,
    expectedStatus = 204
  }) => {
    const visualisation = await createVisualisation(isPublic,
      isOwner ? TEST_USER_ID : objectId());

    const authorization = bearerToken ?
      `Bearer ${bearerToken}` :
        `Basic ${basicToken}`;

    return apiApp
      .delete(`${RESTIFY_PREFIX}/visualisation/${visualisation._id.toString()}`)
      .set('Authorization', authorization)
      .set('Content-Type', 'application/json')
      .expect(expectedStatus);
  };

  const assertPublicVisualisation = async ({
    bearerToken,
    basicToken,
    expectedStatus = 204
  }) =>
    assertVisualisation({
      isPublic: true,
      isOwner: false,
      bearerToken,
      basicToken,
      expectedStatus
    });

  const assertMyBearerPublicVisualisation = async ({
    token,
    expectedStatus = 204
  }) =>
    assertVisualisation({
      isPublic: true,
      isOwner: true,
      bearerToken: token,
      expectedStatus
    });

  const assertPrivateVisualisation = async ({
    bearerToken,
    basicToken,
    expectedStatus = 204
  }) =>
    assertVisualisation({
      isPublic: false,
      isOwner: false,
      bearerToken,
      basicToken,
      expectedStatus
    });

  const assertMyBearerPrivateVisualisation = async ({
    token,
    expectedStatus = 204
  }) =>
    assertVisualisation({
      isPublic: false,
      isOwner: true,
      bearerToken: token,
      expectedStatus
    });



  it('should delete inside the org when using all scope', async () => {
    const token = await createOrgToken([ALL], [], TEST_USER_ID);
    await assertPublicVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertPrivateVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertMyBearerPrivateVisualisation({ token, expectedStatus: 204 });
    await assertMyBearerPublicVisualisation({ token, expectedStatus: 204 });
  });

  it('should delete inside the org when using no scopes', async () => {
    const token = await createOrgToken([], [], TEST_USER_ID);
    await assertPublicVisualisation({ bearerToken: token, expectedStatus: 404 });
    await assertPrivateVisualisation({ bearerToken: token, expectedStatus: 404 });
    await assertMyBearerPublicVisualisation({ token, expectedStatus: 204 });
    await assertMyBearerPrivateVisualisation({ token, expectedStatus: 204 });
  });

  it('should delete inside the org when using edit all scope', async () => {
    const token = await createOrgToken([EDIT_ALL_VISUALISATIONS], [], TEST_USER_ID);
    await assertPublicVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertPrivateVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertMyBearerPublicVisualisation({ token, expectedStatus: 204 });
    await assertMyBearerPrivateVisualisation({ token, expectedStatus: 204 });
  });

  it('should delete inside the org when using edit public scope', async () => {
    const token = await createOrgToken([EDIT_PUBLIC_VISUALISATIONS], [], TEST_USER_ID);
    await assertPublicVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertPrivateVisualisation({ bearerToken: token, expectedStatus: 404 });
    await assertMyBearerPublicVisualisation({ token, expectedStatus: 204 });
    await assertMyBearerPrivateVisualisation({ token, expectedStatus: 204 });
  });

  it('should delete inside the org when using owner org token', async () => {
    const token = await createOwnerOrgToken(TEST_USER_ID);
    await assertPublicVisualisation({ bearerToken: token, expectedStatus: 404 });
    await assertPrivateVisualisation({ bearerToken: token, expectedStatus: 404 });
    await assertMyBearerPublicVisualisation({ token, expectedStatus: 204 });
    await assertMyBearerPrivateVisualisation({ token, expectedStatus: 204 });
  });

  it('should delete inside the org when using site admin token', async () => {
    const token = await createUserToken([SITE_ADMIN], TEST_USER_ID);
    await assertPublicVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertPrivateVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertMyBearerPublicVisualisation({ token, expectedStatus: 204 });
    await assertMyBearerPrivateVisualisation({ token, expectedStatus: 204 });
  });

  // it('should delete when client basic has the ALL scope', async () => {
  //   const token = ?
  //   await assertPublicVisualisation({ basicToken: token, expectedStatus: 204 });
  //   await assertPrivateVisualisation({ basicToken: token, expectedStatus: 204 });
  // });

  // it('should delete when client basic has no scopes', async () => {
  //   const token = ?
  //   await assertPublicVisualisation({ basicToken: token, expectedStatus: 404 });
  //   await assertPrivateVisualisation({ basicToken: token, expectedStatus: 404 });
  // });
});
