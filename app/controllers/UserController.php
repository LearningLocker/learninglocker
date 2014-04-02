<?php

use Locker\Repository\User\UserRepository as User;

class UserController extends BaseController {

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

    $this->user       = $user;
    $this->logged_in_user = Auth::user();

    $this->beforeFilter('auth', array('except' => array('verifyEmail','addPasswordForm')));
    $this->beforeFilter('csrf', array('on' => array('update','updatePassword', 'addPassword', 'destroy')));
    $this->beforeFilter('user.delete', array('only' => 'destroy'));
    $this->beforeFilter('auth.super', array('only' => 'updateRole'));
    
  }

  /**
   * Display a listing of users.
   *
   * @return View
   */
  public function index(){

    return View::make('index', array( 'users' => $this->user->all() ));

  }

  /**
   * Show the form for creating a new resource.
   *
   * @return View
   */
  public function create(){
    
    return View::make('register.index');

  }

  /**
   * Show the form for editing the specified resource.
   *
   * @param  int  $id
   * @return View
   */
  public function edit( $id ){

    return View::make('partials.users.edit')
         ->with( 'user', $this->user->find( $id ) );

  }

  /**
   * Update the specified resource in storage.
   *
   * @param  int  $id
   * @return View
   */
  public function update( $id ){

    $data = Input::all();

    //if email being changed, verify new one, otherwise ignore
    if( $data['email'] != Auth::user()->email ){
      $rules['email'] = 'required|email|unique:users';
    }
    $rules['name']  = 'required';       
    $validator = Validator::make($data, $rules);
    if ($validator->fails()) return Redirect::back()->withErrors($validator);
  
    // Update the user
    $s = $this->user->update($id, $data);

    if($s){
      return Redirect::back()->with('success', Lang::get('users.updated'));
    }

    return Redirect::back()
      ->withInput()
      ->with('error', Lang::get('users.updated_error'));

  }

  /**
   * Update the user's role.
   *
   * @param  int  $id
   * @return View
   */
  public function updateRole( $id ){
    $s = $this->user->updateRole($id, Input::get('role'));
    return Redirect::to('/site/users')
    ->with('success', Lang::get('users.role_change'));
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param  int  $id
   * @return View
   */
  public function destroy( $id ){
    //@todo transfer ownership of all LRSs they admin to super admin
    
    //delete
    $this->user->delete( $id );
    return Redirect::back()->with('success', Lang::get('users.deleted'));
  }


}