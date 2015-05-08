<?php

use \Locker\Repository\Lrs\EloquentRepository as LrsRepo;
use \app\locker\statements\xAPIValidation as XApiValidator;
use \Locker\Helpers\Exceptions as Exceptions;
use \Locker\Helpers\Helpers as Helpers;

/*
|--------------------------------------------------------------------------
| Application & Route Filters
|--------------------------------------------------------------------------
|
| Below you will find the "before" and "after" events for the application
| which may be used to do any work before or after a request into your
| application. Here you may also register your custom route filters.
|
*/

App::before(function($request) {});

App::after(function($request, $response) {
  $response->headers->set('X-Experience-API-Version', '1.0.1');

  if (isset($_SERVER['HTTP_ORIGIN'])) {
    $response->headers->set('Access-Control-Allow-Origin', $_SERVER['HTTP_ORIGIN']);
  }
});

// Checks for logged in user.
Route::filter('auth', function() {
  if (Auth::guest()) return Redirect::guest('/');
});


/*
|--------------------------------------------------------------------------
| Submit statement via basic http authentication
|--------------------------------------------------------------------------
|
| Login in once using key / secret to store statements or retrieve statements.
|
*/
Route::filter('auth.statement', function($route, $request){

  $method = Request::server('REQUEST_METHOD');

  if( $method !== "OPTIONS" ){

    // Validates authorization header.
    $auth_validator = new XApiValidator();
    $authorization = LockerRequest::header('Authorization');
    if ($authorization !== null && strpos($authorization, 'Basic') === 0) {
      $authorization = gettype($authorization) === 'string' ? substr($authorization, 6) : false;
      $auth_validator->checkTypes('auth', $authorization, 'base64', 'headers');
      
      if ($auth_validator->getStatus() === 'failed') {
        throw new Exceptions\Validation($auth_validator->getErrors());
      }
    } else if ($authorization !== null && strpos($authorization, 'Bearer') === 0) {
      $bridgedRequest  = OAuth2\HttpFoundationBridge\Request::createFromRequest(Request::instance());
      $bridgedResponse = new OAuth2\HttpFoundationBridge\Response();
      if (!App::make('oauth2')->verifyResourceRequest($bridgedRequest, $bridgedResponse)) {
        throw new Exceptions\Exception('Unauthorized request.', $bridgedResponse->getStatusCode());
      }
    } else if ($authorization === null) {
      throw new Exceptions\Exception('Unauthorized request.', 401);
    }

    $lrs = Helpers::getLrsFromAuth();

    //attempt login once
    if ( ! Auth::onceUsingId($lrs->owner['_id']) ) {
      throw new Exceptions\Exception('Unauthorized request.', 401);
    }

  }
});

// Checks for super admin.
Route::filter('auth.super', function( $route, $request ){
  if( Auth::user()->role != 'super' ){
    return Redirect::to('/');
  }
});

// Checks for LRS admin.
Route::filter('auth.admin', function( $route, $request ){

  $lrs      = Lrs::find( $route->parameter('lrs') );
  $user     = Auth::user()->_id;
  $is_admin = false;
  foreach( $lrs->users as $u ){
    //is the user on the LRS user list with role admin?
    if($u['user'] == $user && $u['role'] == 'admin'){
      $is_admin = true;
    }
  }
  if( !$is_admin ){
    return Redirect::to('/');
  }

});

// Checks for LRS access.
Route::filter('auth.lrs', function( $route, $request ){
  //check to see if lrs id exists?
  $lrs  = Lrs::find( $route->parameter('id') );
  //if not, let's try the lrs parameter
  if( !$lrs ){
    $lrs  = Lrs::find( $route->parameter('lrs') );
  }
  $user = \Auth::user();

  if( $lrs ){
    //get all users will access to the lrs
    foreach( $lrs->users as $u ){
      $get_users[] = $u['_id'];
    }
    //check current user is in the list of allowed users, or is super admin
    if( !in_array($user->_id, $get_users) && $user->role != 'super' ){
      return Redirect::to('/');
    }

  }else{
    return Redirect::to('/');
  }

});

// Checks for LRS edit access.
Route::filter('edit.lrs', function( $route, $request ){

  //check to see if lrs id exists?
  $lrs  = Lrs::find( $route->parameter('id') );
  //if not, let's try the lrs parameter
  if( !$lrs ){
    $lrs  = Lrs::find( $route->parameter('lrs') );
  }

  $user = \Auth::user();

  if( $lrs ){

    //get all users with admin access to the lrs
    foreach( $lrs->users as $u ){
      if( $u['role'] == 'admin' ){
        $get_users[] = $u['_id'];
      }
    }

    //check current user is in the list of allowed users or is super
    if( !in_array($user->_id, $get_users) && $user->role != 'super' ){
      return Redirect::to('/');
    }

  }else{
    return Redirect::to('/');
  }

});

// Checks for LRS creation access.
Route::filter('create.lrs', function( $route, $request ){

  $site       = Site::first();
  $allowed    = $site->create_lrs;
  $user_role  = \Auth::user()->role;

  if( !in_array($user_role, $allowed) ){
    return Redirect::to('/');
  }

});

/*
|---------------------------------------------------------------------------
| Check whether registration has been enabled
|---------------------------------------------------------------------------
*/

Route::filter('registration.status', function( $route, $request ){
  $site = \Site::first();
  if( $site ){
    if( $site->registration != 'Open' ) return Redirect::to('/');
  }
});

/*
|---------------------------------------------------------------------------
| Check the person deleting a user account, is allowed to.
|
| User's can delete their own account as can super admins
|---------------------------------------------------------------------------
*/

Route::filter('user.delete', function( $route, $request ){
  $user = $route->parameter('users');
  if( \Auth::user()->_id != $user && !\Locker\Helpers\Access::isRole('super') ){
    return Redirect::to('/');
  }
});


/*
|--------------------------------------------------------------------------
| Guest Filter
|--------------------------------------------------------------------------
|
| The "guest" filter is the counterpart of the authentication filters as
| it simply checks that the current user is not logged in. A redirect
| response will be issued if they are, which you may freely change.
|
*/

Route::filter('guest', function()
{
  if (Auth::check()) return Redirect::to('/');
});

/*
|--------------------------------------------------------------------------
| CSRF Protection Filter
|--------------------------------------------------------------------------
|
| The CSRF filter is responsible for protecting your application against
| cross-site request forgery attacks. If this special token in a user
| session does not match the one given in this request, we'll bail.
|
*/

Route::filter('csrf', function()
{
  $token = Request::ajax() ? LockerRequest::header('X-CSRF-Token') : Input::get('_token');
  if (Session::token() !== $token)
  {
    throw new Illuminate\Session\TokenMismatchException;
  }
});
