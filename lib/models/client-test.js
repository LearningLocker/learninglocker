import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Error } from 'mongoose';
import Client from './client';

chai.use(chaiAsPromised);

describe('client model', () => {
  it('should not throw a ValidationError when authority is valid', async () => {
    const f = Client.create({
      authority: JSON.stringify({
        objectType: 'Agent',
        name: 'New Client',
        mbox: 'mailto:hello@learninglocker.net',
      }),
    });

    await expect(f).to.eventually.not.be.rejected;
  });

  it('should throw a ValidationError when authority is invalid', async () => {
    const f = Client.create({
      authority: '{}',
    });

    await expect(f).to.eventually.be.rejectedWith(Error.ValidationError);
  });
});
