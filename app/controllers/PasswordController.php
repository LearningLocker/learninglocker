<?php

use Locker\Repository\User\UserRepository as User;

class PasswordController extends BaseController {

  /**
  * User Repository
  */
  protected $user;

  public function __construct(User $user){
    $this->user = $user;
    $this->beforeFilter('auth', array('only' => array('addPasswordForm', 'addPassword', 'updatePassword')));
  }

  public function remind(){
    return View::make('system.password.remind');
  }

  public function request(){

    $response = Password::remind(Input::only('email'), function($message, $user){
      $message->subject(Lang::get('users.reset'));
    });

    if( $response == Password::INVALID_USER )
      return Redirect::back()->with('error', Lang::get($response));
    else
      return Redirect::back()->with('success', Lang::get($response));

  }

  public function reset( $token = null ){

    if (is_null($token)) App::abort(404);

    return View::make('system.password.reset')->with('token', $token);

  }

  /**
   * Handle the POST request to reset password
   *
   * @return response
   *
   **/
  public function postReset(){

    $credentials = Input::only(
      'email', 'password', 'password_confirmation', 'token'
    );

    $response = Password::reset($credentials, function($user, $password){
      $user->password = Hash::make($password);
      $user->save();
    });

    switch ( $response ){
      case Password::INVALID_PASSWORD:
      case Password::INVALID_TOKEN:
      case Password::INVALID_USER:
        return Redirect::back()->with('error', Lang::get($response));

      case Password::PASSWORD_RESET: 
        return Redirect::to('/')->with('success', Lang::get('reminders.reset'));
    }
    
  }

  /**
   * Update the user's password.
   *
   * @param  int  $id
   * @return View
   */
  public function updatePassword( $id ){

    //check existing password
    $pass_check = Hash::check(Input::get('current_password'), Auth::user()->password);
    if( !$pass_check ) return Redirect::back()->withErrors( array( Lang::get('users.password_current_wrong') ) );

    $rules['password'] = 'required|confirmed';
    $validator = Validator::make(Input::all(), $rules);
    if ($validator->fails()) return Redirect::back()->withErrors($validator);
  
    // Update the user
    $s = $this->user->updatePassword($id, Input::get('password'));

    if($s){
      return Redirect::back()->with('success', Lang::get('users.success'));
    }

    return Redirect::back()
           ->withInput()
           ->withErrors( array( Lang::get('users.password_problem') ) );

  }

  /**
   * Add a password - this is used when users are invited into the platform.
   *
   **/
  public function addPasswordForm(){
    $lrs_list = Lrs::all();
    return View::make('partials.users.addPassword', array( 'user'     => Auth::user(), 
                                                           'lrs_list' => $lrs_list));
  }

  /**
   * Add a password, the action - this is used when users are invited into the platform
   *
   **/
  public function addPassword( $id ){

    $rules['password'] = 'required|confirmed';
    $validator = Validator::make(Input::all(), $rules);
    if ($validator->fails()) return Redirect::back()->withErrors($validator);
  
    // Update the user
    $s = $this->user->updatePassword($id, Input::get('password'));

    if($s){
      return Redirect::to('/lrs')->with('success', Lang::get('users.success'));
    }

    return Redirect::back()
           ->withInput()
           ->withErrors( array( Lang::get('users.password_problem') ) );

  }

}