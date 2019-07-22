import { expect } from 'chai';
import mongoose from 'mongoose';
import Dashboard from './dashboard';

const objectId = mongoose.Types.ObjectId;

describe('dashboard model', () => {
  it('should do nothing if widget ids are unique', async () => {
    const dashboard = await Dashboard.create({
      widgets: [
        {
          _id: objectId('000011110000111100002222'),
          title: 'a',
          visualisation: objectId('000011110000111100001111'),
        },
        {
          _id: objectId('000011110000111100003333'),
          title: 'b',
          visualisation: objectId('000011110000111100001111'),
        }
      ]
    });

    expect(dashboard.widgets[0]._id.toString() === '000011110000111100002222');
    expect(dashboard.widgets[1]._id.toString() === '000011110000111100003333');
  });

  it('should reset widget ids if there is duplication', async () => {
    const dashboard = await Dashboard.create({
      widgets: [
        {
          _id: objectId('000011110000111100002222'),
          title: 'a',
          visualisation: objectId('000011110000111100001111'),
        },
        {
          _id: objectId('000011110000111100002222'),
          title: 'b',
          visualisation: objectId('000011110000111100001111'),
        }
      ]
    });

    expect(dashboard.widgets[0]._id.toString() !== '000011110000111100002222');
    expect(dashboard.widgets[1]._id.toString() !== '000011110000111100002222');
    expect(dashboard.widgets[0]._id.toString() !== dashboard.widgets[1]._id.toString());
  });

  it('should reset widget ids if there is duplication (independent on _id format)', async () => {
    const dashboard = await Dashboard.create({
      widgets: [
        {
          _id: objectId('000011110000111100002222'),
          title: 'a',
          visualisation: objectId('000011110000111100001111'),
        },
        {
          _id: '000011110000111100002222',
          title: 'b',
          visualisation: objectId('000011110000111100001111'),
        }
      ]
    });

    expect(dashboard.widgets[0]._id.toString() !== '000011110000111100002222');
    expect(dashboard.widgets[1]._id.toString() !== '000011110000111100002222');
    expect(dashboard.widgets[0]._id.toString() !== dashboard.widgets[1]._id.toString());
  });
});
