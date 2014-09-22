<?php

/*
|--------------------------------------------------------------
| LRS breadcrumbs
|--------------------------------------------------------------
*/
Breadcrumbs::register('lrs', function($breadcrumbs) {
  $breadcrumbs->push(Lang::get('lrs.list'), url('/lrs'));
});
Breadcrumbs::register('lrs.users', function($breadcrumbs, $lrs) {
  $breadcrumbs->push(Lang::get('lrs.sidebar.users'), url('/lrs/' . $lrs->_id . '/users'));
});
Breadcrumbs::register('create', function($breadcrumbs) {
  $breadcrumbs->parent('lrs');
  $breadcrumbs->push(Lang::get('lrs.create'), url('/lrs'));
});
Breadcrumbs::register('editlrs', function($breadcrumbs, $lrs) {
  $breadcrumbs->parent('lrs', $lrs);
  $breadcrumbs->push(Lang::get('lrs.edit'), url('/lrs/' . $lrs->_id));
});
Breadcrumbs::register('lrs.invite', function($breadcrumbs, $lrs) {
  $breadcrumbs->parent('lrs.users', $lrs);
  $breadcrumbs->push(Lang::get('users.invite.invite'), url('/lrs/' . $lrs->_id . '/users'));
});

/*
|---------------------------------------------------------------
| Site breadcrumbs
|---------------------------------------------------------------
*/
Breadcrumbs::register('users', function($breadcrumbs) {
  $breadcrumbs->push('Users', url('/site#users'));
});
Breadcrumbs::register('site.invite', function($breadcrumbs) {
  $breadcrumbs->parent('users');
  $breadcrumbs->push('Invite users', url('/site/invite'));
});
Breadcrumbs::register('settings', function($breadcrumbs) {
  $breadcrumbs->push('Settings', url('/site#settings'));
});
Breadcrumbs::register('site.edit', function($breadcrumbs, $site) {
  $breadcrumbs->parent('settings');
  $breadcrumbs->push('Edit settings', url('/site/'. $site->_id . '/edit'));
});
/*
|---------------------------------------------------------------
| Statement breadcrumbs
|---------------------------------------------------------------
*/
Breadcrumbs::register('statement', function($breadcrumbs, $lrs) {
  $breadcrumbs->push('Statements', url('/lrs/'.$lrs->_id.'/statements'));
});
Breadcrumbs::register('filter', function($breadcrumbs, $lrs) {
  $breadcrumbs->parent('statement', $lrs);
  $breadcrumbs->push(Lang::get('statements.filter'), url('/lrs/$lrs->_id/statements/generator'));
});
Breadcrumbs::register('generator', function($breadcrumbs, $lrs) {
  $breadcrumbs->parent('statement', $lrs);
  $breadcrumbs->push(Lang::get('statements.generator'), url('/lrs/$lrs->_id/statements/generator'));
});
Breadcrumbs::register('explorer', function($breadcrumbs, $lrs) {
  $breadcrumbs->parent('statement', $lrs);
  $breadcrumbs->push(Lang::get('statements.explorer'), url('/lrs/$lrs->_id/statements/generator'));
});
Breadcrumbs::register('analytics', function($breadcrumbs, $lrs) {
  $breadcrumbs->parent('statement', $lrs);
  $breadcrumbs->push(Lang::get('statements.analytics'), url('/lrs/$lrs->_id/statements/generator'));
});

/*
|------------------------------------------------------------------
| Exporting
|------------------------------------------------------------------
*/
Breadcrumbs::register('exporting', function($breadcrumbs, $lrs) {
  $breadcrumbs->push('Exporting', url('/lrs/'.$lrs->_id.'/exporting'));
});
Breadcrumbs::register('exporting.create', function($breadcrumbs, $lrs) {
  $breadcrumbs->parent('exporting', $lrs);
  $breadcrumbs->push('Create Export', url('/lrs/'.$lrs->_id.'/exporting/create'));
});
Breadcrumbs::register('exporting.view', function($breadcrumbs, $lrs) {
  $breadcrumbs->parent('exporting', $lrs);
  $breadcrumbs->push('View Export', url('/lrs/'.$lrs->_id.'/exporting/show'));
});

/*
|------------------------------------------------------------------
| Reporting
|------------------------------------------------------------------
*/
Breadcrumbs::register('reporting', function($breadcrumbs, $lrs) {
  $breadcrumbs->push(Lang::get('statements.reporting'), url('/lrs/'.$lrs->_id.'/reporting'));
});
Breadcrumbs::register('reporting.create', function($breadcrumbs, $lrs) {
  $breadcrumbs->parent('reporting', $lrs);
  $breadcrumbs->push(Lang::get('reporting.create'), url('/lrs/'.$lrs->_id.'/reporting/create'));
});
Breadcrumbs::register('reporting.view', function($breadcrumbs, $lrs) {
  $breadcrumbs->parent('reporting', $lrs);
  $breadcrumbs->push(Lang::get('reporting.view'), url('/lrs/'.$lrs->_id.'/reporting/show'));
});

/*
|-------------------------------------------------------------------
| OAuth app breadcrumbs
|-------------------------------------------------------------------
*/
Breadcrumbs::register('apps', function($breadcrumbs) {
  $breadcrumbs->push(Lang::get('apps.list'), url('/oauth/apps'));
});
Breadcrumbs::register('apps.create', function($breadcrumbs) {
  $breadcrumbs->parent('apps');
  $breadcrumbs->push(Lang::get('apps.create'), url('/oauth/apps'));
});
Breadcrumbs::register('apps.show', function($breadcrumbs) {
  $breadcrumbs->parent('apps');
  $breadcrumbs->push(Lang::get('apps.show'), url('/oauth/apps'));
});