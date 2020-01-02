import mongoose from 'mongoose';
import { expect } from 'chai';
import encode$oid from '../encode$oid';

const objectId = mongoose.Types.ObjectId;

describe.only('encode$oid', () => {
  it('should encode objectId as $oid', () => {
    const data = {
      organisation: objectId('5b6c06fc5f2cc639c97995b6')
    };

    const encoded = encode$oid(data);

    expect(encoded.organisation.$oid).to.equal('5b6c06fc5f2cc639c97995b6');
  });
});
