import React from 'react';
import Link from 'ui/containers/Link';
import SideNavFooter from 'ui/components/SideNavFooter';
import {
  SideNavContainer,
  NavSideNav, SideNavHeader, activeLinkClassName, OrgAvatar
} from 'ui/containers/SideNav/styled';
import DEFAULT_LOGO from 'ui/static/logos/default/default.gif';


const renderLink = (activeClass, routeName, text) => (
  <li>
    <Link routeName={routeName} activeClassName={activeClass}>
      {text}
    </Link>
  </li>
);

const AdminSideNav = () => {
  const activeClass = `v-link-active ${activeLinkClassName}`;

  return (
    <SideNavContainer className={'col-sm-3 col-md-2'} >
      <SideNavHeader>
        <OrgAvatar>
          <img alt="logo" src={DEFAULT_LOGO} />
        </OrgAvatar>
        <div className="media-body">
          <div style={{ textAlign: 'center' }}>
            Site Settings
          </div>
        </div>
      </SideNavHeader>

      <NavSideNav className={'nav'}>
        { renderLink(activeClass, 'admin.users', 'Users') }
        { renderLink(activeClass, 'admin.organisations', 'Organisations') }
      </NavSideNav>
      <footer>
        <SideNavFooter />
      </footer>
    </SideNavContainer>
  );
};

export default AdminSideNav;
