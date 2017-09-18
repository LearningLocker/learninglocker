import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import SideNavFooter from './index.js';


const WrappedSideNavFooter = withInsertCSS(SideNavFooter);

test('Renders help link', () => {
  const sideNav = ReactTestRenderer.create(<WrappedSideNavFooter />).toJSON();
  expect(sideNav).toMatchSnapshot();
});
