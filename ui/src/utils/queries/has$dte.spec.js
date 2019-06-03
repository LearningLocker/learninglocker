import { fromJS } from 'immutable';
import has$dte from './has$dte';

describe('has$dte', () => {
  test('return true', () => {
    const query = fromJS({
      a: [
        {
          a1: [
            { a11: { a11a: 'x' } },
            { a12: [
              'x',
              { a122a: 'x' }
            ] },
          ],
          a2: {
            a2a: 'x',
            a2b: 'x',
          }
        },
        {
          ab: {
            aba: [],
            abb: {
              $dte: 'x',
            },
          },
        }
      ]
    });

    expect(has$dte(query)).toEqual(true);
  });

  test('return false', () => {
    const query = fromJS({
      a: [
        {
          a1: [
            { a11: { a11a: 'x' } },
            { a12: [
              'x',
              { a122a: 'x' }
            ] },
          ],
          a2: {
            a2a: 'x',
            a2b: 'x',
          }
        },
        {
          ab: {
            aba: [],
            abb: {
              sdte: 'x',
            },
          },
        }
      ]
    });

    expect(has$dte(query)).toEqual(false);
  });
});
