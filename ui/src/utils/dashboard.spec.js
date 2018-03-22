import { expect } from 'chai';
import { Map } from 'immutable';
import getRouteUrl from 'ui/utils/getRouteUrl';
import { getShareableUrl } from './dashboard';

describe('dashboard helper', () => {
  it('should get dashboard url for model', () => {
    global.window = {
      location: {
        origin: 'http://localhost'
      }
    };

    const model = new Map({
      _id: '12345',
      title: '~ a shareable dashboard'
    });

    const parentModel = new Map({
      _id: '98765'
    });


    const result = getShareableUrl({
      model,
      parentModel
    });

    expect(result).to.equal(`${getRouteUrl()}/dashboards/98765/12345/~a-shareable-dashboard`);
  });
});
