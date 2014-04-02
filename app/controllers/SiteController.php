<?php

use Locker\Repository\Site\SiteRepository as Site;

class SiteController extends BaseController {

  /**
  * Site
  */
  protected $site;


  /**
   * Construct
   *
   * @param Site $site
   */
  public function __construct(Site $site){

    $this->site = $site;

    $this->beforeFilter('auth');
    $this->beforeFilter('csrf', array('on' => 'update', 'verifyUser'));
    $this->beforeFilter('auth.super');

  }

  /**
   * Display a listing of statements for a user.
   *
   * @return View
   */
  public function index(){

    $site  = $this->site->all();
    return View::make('partials.site.dashboard', array('site' => $site));

  }

  /**
   * Show the form for editing the specified resource.
   *
   * @param  int  $id
   * @return View
   */
  public function edit( $id ){

    $site = $this->site->find( $id );
    return View::make('partials.site.edit', array('site'         => $site, 
                                                  'settings_nav' => true));

  }

  /**
   * Update the specified resource in storage.
   *
   * @param  int  $id
   * @return View
   */
  public function update($id){

    // Update site details
    $s = $this->site->update( $id, Input::all() );

    if($s){
      return Redirect::back()->with('success', Lang::get('site.updated'));
    }

    return Redirect::back()
      ->withInput()
      ->withErrors($user->errors());

  }

  /**
   * Display the super admin settings.
   *
   * @return Response
   */
  public function settings(){
    return Response::json( $this->site->all() );
  }

  /**
   * Grab site stats
   *
   * @return Response
   **/
  public function getStats(){
    $stats = new \app\locker\data\dashboards\AdminDashboard();
    return Response::json( $stats );
  }

  /**
   * Display the super admin lrs view.
   *
   * @return Response
   */
  public function lrs(){

    $lrs = Lrs::all();
    if( $lrs ){
      foreach( $lrs as $l ){
        $l->statement_total = \Statement::where(SPECIFIC_LRS, $l->_id)->remember(5)->count();
      }
    }
    return Response::json( $lrs );
   
  }

  public function apps(){
    return OAuthApp::all();
  }

  /**
   * Display the super admin user list view.
   *
   * @return Response
   */
  public function users(){

    $users = User::orderBy('created_at', 'asc')->get();
    foreach($users as &$u){
      $u->lrs_owned  = Lrs::where('owner._id', $u->_id)->select('title')->get()->toArray();
      $u->lrs_member = Lrs::where('users.user', $u->_id)->select('title')->get()->toArray();
    }
    return Response::json( $users );

  }

  /**
   * Display the invite user page
   *
   * @return Response
   */
  public function inviteUsersForm(){
    return View::make('partials.site.invite', array('users_nav'  => true, 
                                                    'admin_dash' => true));
  }

  /**
   * Invite in the users
   *
   **/
  public function inviteUsers(){
    $invite = \app\locker\helpers\User::inviteUser( Input::all() );
    return Redirect::back()
      ->with('success', Lang::get('users.invite.invited'));
  
  }

  /**
   * Verify a user.
   **/
  public function verifyUser($id){
    $verify = $this->site->verifyUser($id);
    return Redirect::back()
         ->with('success', Lang::get('users.verify_success'));
  }

}