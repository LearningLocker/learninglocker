<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', function(){
  if( Auth::check() ){
    $site = \Site::first();
    //if super admin, show site dashboard, otherwise show list of LRSs can access
    if( Auth::user()->role == 'super' ){
      $list = Lrs::all();
      return View::make('partials.site.dashboard', 
                  array('site' => $site, 'list' => $list, 'dash_nav' => true));
    }else{
      $lrs = Lrs::where('users._id', \Auth::user()->_id)->get();
      return View::make('partials.lrs.list', array('lrs' => $lrs, 'list' => $lrs, 'site' => $site));
    }
  }else{
    $site = \Site::first();
    if( isset($site) ){
      return View::make('system.forms.login', array( 'site' => $site ));
    }else{
      return View::make('system.forms.register');
    }
  }
});

/*
|------------------------------------------------------------------
| Login
|------------------------------------------------------------------
*/
Route::get('login', array(
  'before' => 'guest',
  'uses'   => 'LoginController@create',
  'as'     => 'login.create'
));
Route::post('login', array(
  'before' => 'guest',
  'uses'   => 'LoginController@login',
  'as'     => 'login.store'
));
Route::get('logout', array(
  'uses' => 'LoginController@destroy',
  'as'   => 'logout'
));

/*
|------------------------------------------------------------------
| Register
|------------------------------------------------------------------
*/
Route::get('register', array(
  'before' => 'guest',
  'uses'   => 'RegisterController@index',
  'as'     => 'register.index'
));
Route::post('register', array(
  'before' => 'guest',
  'uses'   => 'RegisterController@store',
  'as'     => 'register.store'
));

/*
|------------------------------------------------------------------
| Password reset
|------------------------------------------------------------------
*/
Route::get('password/reset', array(
  'uses' => 'PasswordController@remind',
  'as'   => 'password.remind'
));
Route::post('password/reset', array(
  'uses' => 'PasswordController@request',
  'as'   => 'password.request'
));
Route::get('password/reset/{token}', array(
  'uses' => 'PasswordController@reset',
  'as'   => 'password.reset'
));
Route::post('password/reset/{token}', array(
  'uses' => 'PasswordController@postReset',
  'as'   => 'password.update'
));

/*
|------------------------------------------------------------------
| Email verification
|------------------------------------------------------------------
*/
Route::post('email/resend', function(){
   Event::fire('user.email_resend', array(Auth::user()));
   return Redirect::back()->with('success', Lang::get('users.verify_request') );
});
Route::get('email/verify/{token}', array(
  'uses' => 'EmailController@verifyEmail',
  'as'   => 'email.verify'
));
Route::get('email/invite/{token}', array(
  'uses' => 'EmailController@inviteEmail',
  'as'   => 'email.invite'
));

/*
|------------------------------------------------------------------
| Site (this is for super admin users only)
|------------------------------------------------------------------
*/
Route::get('site', array(
  'uses' => 'SiteController@index',
));
Route::get('site/settings', array(
  'uses' => 'SiteController@settings',
));
Route::get('site/apps', array(
  'uses' => 'SiteController@apps',
));
Route::get('site/stats', array(
  'uses' => 'SiteController@getStats',
));
Route::get('site/lrs', array(
  'uses' => 'SiteController@lrs',
));
Route::get('site/users', array(
  'uses' => 'SiteController@users',
));
Route::get('site/invite', array(
  'uses' => 'SiteController@inviteUsersForm',
  'as'   => 'site.invite'
));
Route::post('site/invite', array(
  'uses' => 'SiteController@inviteUsers',
));
Route::get('site/plugins', array(
  'uses' => 'PluginController@index',
));
Route::resource('site', 'SiteController');
Route::put('site/users/verify/{id}', array(
  'uses' => 'SiteController@verifyUser',
  'as'   => 'user.verify'
));

/*
|------------------------------------------------------------------
| Lrs
|------------------------------------------------------------------
*/
Route::get('lrs/{id}/statements', array(
  'uses' => 'LrsController@statements',
));
Route::get('lrs/{id}/endpoint', array(
  'uses' => 'LrsController@endpoint',
));
Route::get('lrs/{id}/users', array(
  'uses' => 'LrsController@users',
));
Route::get('lrs/{id}/stats/{segment?}', array(
  'uses' => 'LrsController@getStats',
));
Route::put('lrs/{id}/users/remove', array(
  'uses' => 'LrsController@usersRemove',
  'as'   => 'lrs.remove'
));
Route::put('lrs/{id}/users/{user}/changeRole/{role}', array(
  'uses' => 'LrsController@changeRole',
  'as'   => 'lrs.changeRole'
));
Route::get('lrs/{id}/users/invite', array(
  'uses' => 'LrsController@inviteUsersForm',
));
Route::get('lrs/{id}/api', array(
  'uses' => 'LrsController@api',
));
Route::post('lrs/{id}/apikey', array( 
  'before' => 'csrf', 
  'uses'   => 'LrsController@editCredentials'
));

Route::resource('lrs', 'LrsController');

/*
|------------------------------------------------------------------
| Exporting
|------------------------------------------------------------------
*/

// Pages.
Route::get('lrs/{id}/exporting', array(
  'uses' => 'ExportingController@index',
));

//Route::resource('reporting', 'ReportingController');

//save,view,edit,delete reports
Route::post('lrs/{id}/exporting/save', array(
  'uses' => 'ReportingController@store',
));
Route::get('lrs/{id}/exporting/show/{report}', array(
  'uses' => 'ReportingController@show',
));
Route::delete('lrs/{id}/exporting/delete/{report}', array(
  'uses' => 'ReportingController@destroy',
));
Route::get('lrs/{id}/exporting/getReports/{limt?}', array(
  'uses' => 'ReportingController@getReports',
));

/*
|------------------------------------------------------------------
| Lrs client
|------------------------------------------------------------------
*/
Route::get('lrs/{id}/client/manage', array(
  'uses' => 'ClientController@manage',
  'as' => 'client.manage'
));

Route::delete('lrs/{lrs_id}/client/{id}/destory', array(
  'uses' => 'ClientController@destroy',
  'as' => 'client.destroy'
));

Route::get('lrs/{lrs_id}/client/{id}/edit', array(
  'uses' => 'ClientController@edit',
  'as' => 'client.edit'
));

Route::post('lrs/{id}/client/create', array(
  'before' => 'csrf', 
  'uses' => 'ClientController@create',
  'as' => 'client.create'
));

Route::put('lrs/{lrs_id}/client/{id}/update', array(
  'before' => 'csrf', 
  'uses' => 'ClientController@update',
  'as' => 'client.update'
));

/*
|------------------------------------------------------------------
| Reporting
|------------------------------------------------------------------
*/

//index and create pages
Route::get('lrs/{id}/reporting', array(
  'uses' => 'ReportingController@index',
));
Route::get('lrs/{id}/reporting/create', array(
  'uses' => 'ReportingController@create',
));

//get data and statements, returns json
Route::get('lrs/{id}/reporting/data', array(
  'uses' => 'ReportingController@getData',
));
Route::get('lrs/{id}/reporting/statements', array(
  'uses' => 'ReportingController@getStatements',
));
//routes to query actors and activities, returns json
Route::get('lrs/{id}/reporting/actors/{query}', array(
  'uses' => 'ReportingController@getActors',
));


//used by typeahead to get objects
Route::get('lrs/{id}/reporting/typeahead/{segment}', array(
  'uses' => 'ReportingController@getTypeahead',
));

//Route::resource('reporting', 'ReportingController');

//save,view,edit,delete reports
Route::post('lrs/{id}/reporting/save', array(
  'uses' => 'ReportingController@store',
));
Route::get('lrs/{id}/reporting/show/{report}', array(
  'uses' => 'ReportingController@show',
));
Route::delete('lrs/{id}/reporting/delete/{report}', array(
  'uses' => 'ReportingController@destroy',
));
Route::get('lrs/{id}/reporting/getReports/{limt?}', array(
  'uses' => 'ReportingController@getReports',
));


/*
|------------------------------------------------------------------
| Users
|------------------------------------------------------------------
*/
Route::resource('users', 'UserController');
Route::put('users/update/password/{id}', array(
  'as'     => 'users.password',
  'before' => 'csrf', 
  'uses'   => 'PasswordController@updatePassword'
));
Route::put('users/update/role/{id}/{role}', array(
  'as'     => 'users.role',
  'uses'   => 'UserController@updateRole'
));
Route::get('users/{id}/add/password', array(
  'as'     => 'users.addpassword',
  'uses'   => 'PasswordController@addPasswordForm'
));
Route::put('users/{id}/add/password', array(
  'as'     => 'users.addPassword',
  'before' => 'csrf', 
  'uses'   => 'PasswordController@addPassword'
));

/*
|------------------------------------------------------------------
| Statements
|------------------------------------------------------------------
*/
Route::get('lrs/{id}/statements/generator', 'StatementController@create');
Route::get('lrs/{id}/statements/explorer/{extra?}', 'ExplorerController@explore')
->where(array('extra' => '.*'));
Route::get('lrs/{id}/statements/{extra}', 'ExplorerController@filter')
->where(array('extra' => '.*'));

Route::resource('statements', 'StatementController');

//temp for people running the dev version pre v1.0 to migrate statements
//can only be run by super admins.
Route::get('migrate', array(
  'as'     => 'users.addpassword',
  'before' => 'auth.super',
  'uses'   => 'MigrateController@runMigration'
));
Route::post('migrate/{id}', array(
  'before' => 'auth.super',
  'uses'   => 'MigrateController@convertStatements'
));

/*
|------------------------------------------------------------------
| Information pages e.g. terms, privacy
|------------------------------------------------------------------
*/

Route::get('terms', function(){
  return View::make('partials.pages.terms');
});
//tools
Route::get('tools', array(function(){
  return View::make('partials.pages.tools', array('tools' => true));
}));
Route::get('help', array(function(){
  return View::make('partials.pages.help', array('help' => true));
}));
Route::get('about', array(function(){
  return View::make('partials.pages.about');
}));

/*
|------------------------------------------------------------------
| Statement API
|------------------------------------------------------------------
*/


Route::group( array('prefix' => 'data/xAPI/', 'before'=>'auth.statement'), function(){

  Config::set('xapi.using_version', '1.0.1');

  Route::options('/{extra}',  'Controllers\API\BaseController@CORSOptions')->where('extra', '(.*)');

  Route::get('/about', function() {
    return Response::json( array('X-Experience-API-Version'=>Config::get('xapi.using_version')));
  });

  //statement resource (post, put, get, delete) route
  Route::get('statements/grouped', array(
    'uses' => 'Controllers\xAPI\StatementsController@grouped',
  ));
  Route::put('statements', array(
    'uses' => 'Controllers\xAPI\StatementsController@storePut',
  ));
  Route::resource('statements', 'Controllers\xAPI\StatementsController');

  //Agent API
  Route::get('agents/profile', array(
    'uses' => 'Controllers\xAPI\AgentController@index',
  ));
  Route::put('agents/profile', array(
    'uses' => 'Controllers\xAPI\AgentController@store',
  ));
  Route::post('agents/profile', array(
    'uses' => 'Controllers\xAPI\AgentController@store',
  ));
  Route::delete('agents/profile', array(
    'uses' => 'Controllers\xAPI\AgentController@delete',
  ));
  Route::any('agents/profile', array(
    'uses' => 'Controllers\xAPI\AgentController@index',
  ));
  Route::get('agents', array(
    'uses' => 'Controllers\xAPI\AgentController@search',
  ));

  //Activiy API
  Route::get('activities/profile', array(
    'uses' => 'Controllers\xAPI\ActivityController@index',
  ));
  Route::put('activities/profile', array(
    'uses' => 'Controllers\xAPI\ActivityController@store',
  ));
  Route::post('activities/profile', array(
    'uses' => 'Controllers\xAPI\ActivityController@store',
  ));
  Route::delete('activities/profile', array(
    'uses' => 'Controllers\xAPI\ActivityController@delete',
  ));
  Route::any('activities/profile', array(
    'uses' => 'Controllers\xAPI\ActivityController@index',
  ));

  Route::get('activities', array(
    'uses' => 'Controllers\xAPI\ActivityController@full',
  ));

  //State API
  Route::get('activities/state', array(
    'uses' => 'Controllers\xAPI\StateController@index',
  ));
  Route::put('activities/state', array(
    'uses' => 'Controllers\xAPI\StateController@store',
  ));
  Route::post('activities/state', array(
    'uses' => 'Controllers\xAPI\StateController@store',
  ));
  Route::delete('activities/state', array(
    'uses' => 'Controllers\xAPI\StateController@delete',
  ));
  Route::any('activities/state', array(
    'uses' => 'Controllers\xAPI\StateController@index',
  ));  
  
  //Basic Request API
  Route::post('Basic/request', array(
    'uses' => 'Controllers\xAPI\BasicRequestController@store',
  ));

});

/*
|------------------------------------------------------------------
| Learning Locker RESTful API
|------------------------------------------------------------------
*/

Route::group( array('prefix' => 'api/v1', 'before'=>'auth.statement'), function(){

  Config::set('api.using_version', 'v1');

  Route::options('/{extra}',  'Controllers\API\BaseController@CORSOptions')->where('extra', '(.*)');

  Route::get('/', function() {
    return Response::json( array('version' => Config::get('api.using_version')));
  });
  Route::get('query/analytics', array(
    'uses' => 'Controllers\API\AnalyticsController@index'
  ));
  Route::get('query/statements', array(
    'uses' => 'Controllers\API\StatementController@index'
  ));
  Route::get('query/{section}', array(
    'uses' => 'Controllers\API\AnalyticsController@getSection'
  ));
  
  Route::get('exports/{export_id}/show', array(
    'uses' => 'Controllers\API\ExportingController@show'
  ));

  Route::get('exports/{export_id}/show/csv', array(
    'uses' => 'Controllers\API\ExportingController@showCSV'
  ));

  Route::get('exports', array(
    'uses' => 'Controllers\API\ExportingController@getAll'
  ));

  Route::get('exports/{export_id}', array(
    'uses' => 'Controllers\API\ExportingController@get'
  ));

  Route::post('exports', array(
    'uses' => 'Controllers\API\ExportingController@create'
  ));

  Route::put('exports/{export_id}', array(
    'uses' => 'Controllers\API\ExportingController@update'
  ));

  Route::delete('exports/{export_id}', array(
    'uses' => 'Controllers\API\ExportingController@destroy'
  ));

  Route::get('reports', array(
    'uses' => 'Controllers\API\ReportController@getAll'
  ));

  Route::resource('site', 'Controllers\API\SiteController');

});

/*
|----------------------------------------------------------------------
| oAuth handling
|----------------------------------------------------------------------
*/

Route::resource('oauth/apps','OAuthAppController');

Route::post('oauth/access_token', function(){
    return AuthorizationServer::performAccessTokenFlow();
});

Route::get('oauth/authorize', array('before' => 'check-authorization-params|auth', function(){

  $params = Session::get('authorize-params');
  $params['user_id'] = Auth::user()->id;
  $app_details = \OAuthApp::where('client_id', $params['client_id'] )->first();
  return View::make('partials.oauth.forms.authorization-form', array('params'      => $params, 
                                                                     'app_details' => $app_details));

}));

Route::post('oauth/authorize', array('before' => 'check-authorization-params|auth|csrf', function(){
  
  $params = Session::get('authorize-params');
  $params['user_id'] = Auth::user()->id;

  if (Input::get('approve') !== null) {
    $code = AuthorizationServer::newAuthorizeRequest('user', $params['user_id'], $params);
    Session::forget('authorize-params');
    return Redirect::to(AuthorizationServer::makeRedirectWithCode($code, $params));
  }

  if (Input::get('deny') !== null) {
    Session::forget('authorize-params');
    return Redirect::to(AuthorizationServer::makeRedirectWithError($params));
  }

}));

Route::get('secure-route', array('before' => 'oauth:basic', function(){
    return "oauth secured route ";
}));



/*
|------------------------------------------------------------------
| For routes that don't exist
|------------------------------------------------------------------
*/
App::missing(function($exception){

  if ( Request::segment(1) == "data" || Request::segment(1) == "api" ) {
    $error = array(
      'error'     =>  true,
      'message'   =>  $exception->getMessage(),
      'code'      =>  $exception->getStatusCode()
    );

    return Response::json( $error, $exception->getStatusCode());
  } else {
    return Response::view( 'errors.missing', array( 'message'=>$exception->getMessage() ), 404);
  }
});

App::error(function(Exception $exception)
{

  Log::error($exception);
  
  if (method_exists($exception, 'getStatusCode')) {
    $code = $exception->getStatusCode();
  } else {
    $code = 500;
  }

  if( Request::segment(1) == "data" || Request::segment(1) == "api" ){
    $error = array(
        'error'     =>  true,
        'message'   =>  $exception->getMessage(),
        'code'      =>  $code
    );

    if( Config::get('app.debug') ){
      $error['trace'] = $exception->getTrace();
    }

    return Response::json( $error, $code);
  } else {
    echo "Status: ".$code." Error: ".$exception->getMessage();
  }
});