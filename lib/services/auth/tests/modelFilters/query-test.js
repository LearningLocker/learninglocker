import testShareableModel
  from 'lib/services/auth/tests/utils/testShareableModel';
import {
  VIEW_PUBLIC_QUERIES,
  EDIT_PUBLIC_QUERIES,
  VIEW_ALL_QUERIES,
  EDIT_ALL_QUERIES
} from 'lib/constants/orgScopes';

testShareableModel({
  modelName: 'query',
  viewAllScopes: [VIEW_ALL_QUERIES],
  editAllScopes: [EDIT_ALL_QUERIES],
  viewPublicScope: VIEW_PUBLIC_QUERIES,
  editPublicScope: EDIT_PUBLIC_QUERIES
});
