/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import totalUsage from './totalUsage';

describe('totalUsage', () => {
  const buildOrgStats = (ownCount, orgId, parentOrgId) => {
    const orgStats = {
      organisation: orgId,
      ownCount,
      ownEstimatedBytes: ownCount * 10,
      totalCount: 0,
      totalEstimatedBytes: 0
    };
    if (parentOrgId) {
      orgStats.parentOrganisation = parentOrgId;
    }
    return orgStats;
  };

  /**
   * Build orgStats list
   *
   * Following organisation tree is supposed
   *
   * org0       org4
   * ├────┐     │
   * org1 org3  org5
   * │          ├────┬────┐
   * org2       org6 org8 org9
   *            │
   *            org7
   */
  const buildOrgStatsList = () => {
    const org0 = '000000000000000000000000';
    const org1 = '000000000000000000000001';
    const org2 = '000000000000000000000002';
    const org3 = '000000000000000000000003';
    const org4 = '000000000000000000000004';
    const org5 = '000000000000000000000005';
    const org6 = '000000000000000000000006';
    const org7 = '000000000000000000000007';
    const org8 = '000000000000000000000008';
    const org9 = '000000000000000000000009';

    const s0 = buildOrgStats(1, org0);
    const s1 = buildOrgStats(2, org1, org0);
    const s2 = buildOrgStats(4, org2, org1);
    const s3 = buildOrgStats(8, org3, org0);
    const s4 = buildOrgStats(16, org4);
    const s5 = buildOrgStats(32, org5, org4);
    const s6 = buildOrgStats(64, org6, org5);
    const s7 = buildOrgStats(128, org7, org6);
    const s8 = buildOrgStats(256, org8, org5);
    const s9 = buildOrgStats(512, org9, org5);
    return [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9];
  };

  it('Should return orgStats that has correct total usage values', () => {
    const orgStatsList = buildOrgStatsList();
    const actual = totalUsage(orgStatsList);

    expect(actual[0].totalCount).to.equal(15);
    expect(actual[1].totalCount).to.equal(6);
    expect(actual[2].totalCount).to.equal(4);
    expect(actual[3].totalCount).to.equal(8);
    expect(actual[4].totalCount).to.equal(1008);
    expect(actual[5].totalCount).to.equal(992);
    expect(actual[6].totalCount).to.equal(192);
    expect(actual[7].totalCount).to.equal(128);
    expect(actual[8].totalCount).to.equal(256);
    expect(actual[9].totalCount).to.equal(512);

    expect(actual[0].totalEstimatedBytes).to.equal(150);
    expect(actual[1].totalEstimatedBytes).to.equal(60);
    expect(actual[2].totalEstimatedBytes).to.equal(40);
    expect(actual[3].totalEstimatedBytes).to.equal(80);
    expect(actual[4].totalEstimatedBytes).to.equal(10080);
    expect(actual[5].totalEstimatedBytes).to.equal(9920);
    expect(actual[6].totalEstimatedBytes).to.equal(1920);
    expect(actual[7].totalEstimatedBytes).to.equal(1280);
    expect(actual[8].totalEstimatedBytes).to.equal(2560);
    expect(actual[9].totalEstimatedBytes).to.equal(5120);
  });
});
