<?php

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

App::before(function($request)
{
  //
});


App::after(function($request, $response)
{
  $response->headers->set('X-Experience-API-Version', '1.0.1');
});

/*
|--------------------------------------------------------------------------
| Authentication Filters
|--------------------------------------------------------------------------
|
| The following filters are used to verify that the user of the current
| session is logged into this application. The "basic" filter easily
| integrates HTTP Basic authentication for quick, simple checking.
|
*/

Route::filter('auth', function()
{
  if (Auth::guest()) return Redirect::guest('/');
});

Route::filter('auth.basic', function()
{
  return Auth::basic();
});


/*
|--------------------------------------------------------------------------
| Submit statement via basic http authentication
|--------------------------------------------------------------------------
|
| Login in once using key / secret to store statements or retrieve statements.
|
*/

Route::filter('auth.statement', function(){

  //set passed credentials
  $key    = Request::getUser();
  $secret = Request::getPassword();

  $method = Request::server('REQUEST_METHOD');

  if( $method !== "OPTIONS" ){

    //see if the lrs exists based on key and secret
    $lrs = \Lrs::where('api.basic_key', $key)
        ->where('api.basic_secret', $secret)
        ->select('owner._id')->first();

    //if no id found, return error
    if ( $lrs == NULL ) {
      return Response::json(array(
        'error' => true,
        'message' => 'Unauthorized request.'),
        401
      ); 
    }

    //attempt login once
    if ( ! Auth::onceUsingId($lrs->owner['_id']) ) {
      return Response::json(array(
        'error' => true,
        'message' => 'Unauthorized Request'),
        401
      ); 
    }
    
  }

});


/*
|--------------------------------------------------------------------------
| Check for super admin
|--------------------------------------------------------------------------
|
| Check the logged in user is a super admin.
|
*/

Route::filter('auth.super', function( $route, $request ){
  if( Auth::user()->role != 'super' ){
    return Redirect::to('/');
  }
});

/*
|--------------------------------------------------------------------------
| LRS admin access
|--------------------------------------------------------------------------
|
| Check the logged in user has admin privilages for current LRS. If not, 
| then redirect to home page without a message. 
|
*/

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

/*
|--------------------------------------------------------------------------
| LRS access
|--------------------------------------------------------------------------
|
| Check logged in user can access the current lrs. To access an LRS you have
| to be the site super admin, the LRS owner (admin) or have been invited in.
|
*/

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

/*
|--------------------------------------------------------------------------
| Who can create a new LRS?
|--------------------------------------------------------------------------
|
| Super admins can decide who is allowed to create new LRSs. Super, existing 
| admins or everyone, including observers.
|
*/

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

Route::filter('registation.status', function( $route, $request ){
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
  if( \Auth::user()->_id != $user && !\app\locker\helpers\Access::isRole('super') ){
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
  if (Session::token() != Input::get('_token'))
  {
    throw new Illuminate\Session\TokenMismatchException;
  }
});