import styled from 'styled-components';

export const activeLinkClassName = 'nav-link-active';

export const SideNavHeader = styled.header``;

export const SideNavFooter = styled.footer``;

export const SideNavInner = styled.div``;

export const NavSideNav = styled.ul``;

export const SubNav = styled.ul``;

export const OrgAvatar = styled.div`
  display: block;
  margin: 0 auto 20px auto;

  img {
    width: 100px;
    background-color: #fff;
    height: auto;
  }
`;

export const SideNavContainer = styled.div`
  display: none;

  @media (max-width: 768px) {
    width: 27%;
  }

  @media (min-width: 568px) {
    position: fixed;
    top: 56px;
    bottom: 0;
    left: 0;
    z-index: 10;
    display: block;
    padding: 20px;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #fff;
    border-right: 1px solid #d9e3ea;
    /* Sub-Menu Item - BG Color */
    /* Sub-Menu Item - BG Color:hover */
    /* Sub-Menu Item - BG Color:hover */
    /* Sub-Menu Item - Border Color:hover */

    ${SideNavInner} {
      min-height: 100%;
      position: relative;
    }

    a {
      color: #444;

      &:hover {
        background-color: rgba(245, 171, 53, 0.801) !important;
        color: white !important;
      }

      &:focus {
        outline: none;
        color: rgba(245, 171, 53, 0.801)
      }
    }

    ul {
      &${NavSideNav} {
        margin: 20px -20px 0px -20px;
        padding: 0 0 100px 0;
        position: relative;
      }

      &${SubNav} {
        li {
          a {
            padding-left: 30px;
            color: #777;
            background: #fafafa;
          }
        }
      }

      li {
        a {
          padding: 12px 24px 12px 28px;
          color: #515253;
          font-weight: 400;

          &.${activeLinkClassName},
          &:hover {
            color: #F5AB35;
            background: transparent;
            box-shadow: inset 20px 0 0px -15px #F5AB35;
          }

          i {
            font-size: 20px;
            vertical-align: middle;
            margin-top: -2px !important;
            margin-right: 10px;
          }
        }

        > ul {
          li {
            background: #fafafa; /*#454241; */
            padding-left: 30px;
            box-shadow: inset 20px 0 0px -15px #F5AB35;
          }
        }
      }
    }

    .fa-sidenav {
      margin-right: 10px;
    }

    ${NavSideNav} {
      > li {
        > ul {
          > li {
            &:focus {
              > a {
                &:after {
                  background: #fafafa;
                  color: #000;
                  font-weight: 600;
                  box-shadow: none;
                }
              }
            }

            &:hover {
              > a {
                &:after {
                  color: rgb(241, 149, 0);
                }
              }
            }

            a {
              &:hover,
              &:focus {
                color: inherit;
                box-shadow: none;
              }

              &.${activeLinkClassName} {
                background: #fafafa;
                color: #000;
                font-weight: 600;
                box-shadow: none;
              }
            }
          }
        }
      }
    }

    .loggedin-user {
      text-align: center;
    }

    ${SideNavHeader} {
      text-align: center;
    }

    ${SideNavFooter} {
      position: absolute;
      bottom: 0;
    }
  }
`;
