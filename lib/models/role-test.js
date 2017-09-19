import { expect } from 'chai';
import async from 'async';
import Role, { canDelete } from './role';

describe('role', () => {
  it('canDelete should return false if last role', async () => {
    const organisationId = '561a679c0c5d017e4004715a';

    const role1 = {
      _id: '961a679c0c5d017e4004715c',
      title: 'Can not delete',
      organisation: organisationId,
      description: 'test'
    };

    await new Promise((resolve, reject) => {
      async.parallel({
        role1: insertDone => Role.create(
          role1,
          insertDone
        ),
        role2: insertDone => Role.create({
          title: 'Another role',
          organisation: '661a679c0c5d017e4004715b'
        }, insertDone)
      }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Test
    const result = await canDelete(role1);
    expect(result).to.equal(false);

    await Role.remove({});
  });

  it('canDelete should return true if not last role', async () => {
    const organisationId = '561a679c0c5d017e4004715a';

    const role1 = {
      _id: '961a679c0c5d017e4004715c',
      title: 'Can not delete',
      organisation: organisationId,
      description: 'test'
    };

    await new Promise((resolve, reject) => {
      async.parallel({
        role1: insertDone => Role.create(
          role1,
          insertDone
        ),
        role2: insertDone => Role.create({
          title: 'Another role',
          organisation: '661a679c0c5d017e4004715b'
        }, insertDone),
        role3: insertDone => Role.create({
          title: 'role3',
          organisation: organisationId
        }, insertDone)
      }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Test
    const result = await canDelete(role1);
    expect(result).to.equal(true);

    await Role.remove({});
  });
});
