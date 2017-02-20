<?php

use Locker\Repository\User\UserRepository as User;

class EmailController extends BaseController {

  /**
  * User
  */
  protected $user;


  /**
   * Construct
   *
   * @param User $user
   */
  public function __construct(User $user){

    $this->user = $user;
    $this->beforeFilter('auth', array('except' => array('index', 'show', 'verifyEmail', 'inviteEmail')));

  }

  /**
   * Verify different email addresses
   *
   **/
  public function email( $id ){

    $user = $this->user->find( $id );
    return View::make('partials.users.email')->with('user', $user)->with('email_nav',true);

  }

  /**
   * Resend the verification email
   **/
  public function resendEmail(){

    $exists = DB::table('users')
              ->where('_id', Auth::user()->_id)
              ->where('email', Input::get('email'))
              ->pluck('username');
    if( !$exists ){
      return Redirect::back()->with('error', 'There was a problem resending.');
    }
    //provide a hook for notification
    Event::fire('user.email_resend', array( Auth::user() ));
    return Redirect::back()->with('flash', 'Please check your email inbox to verify.');
  }

  /**
   * Verify emails
   *
   **/
  public function verifyEmail( $token ){
    $message_type = 'error';
    $message = \Lang::get('users.email_verified_problem');

    if($this->user->verifyEmail( $token )){
        $message_type = 'success';
        $message = \Lang::get('users.email_verified');
    }
    return Redirect::to('/')->with($message_type, $message);
  }

  /**
   * Invite emails
   *
   **/
  public function inviteEmail( $token ){

    $message = $this->user->verifyEmail( $token );
    //now login and direct to password reset form
    $email = \DB::table('user_tokens')
              ->where('token', $token)
              ->pluck('email');
    $user = \User::where('email', $email)->first();
    if (!isset($user->_id)) \App::abort(404, 'Your email verification link has expired - please request a new one. ');
    Auth::loginUsingId($user->_id);
    \DB::table('user_tokens')
      ->where('token', $token)
      ->delete();
    return Redirect::to('/users/'. $user->_id . '/add/password');

  }


}
