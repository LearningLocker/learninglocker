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

    $stats = new \app\locker\data\dashboards\AdminDashboard();
    $site  = $this->site->all();
    return View::make('partials.site.dashboard', 
                  array('stats'      => $stats->stats,
                        'site'       => $site,
                        'dash_nav'   => true,
                        'admin_dash' => true));

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

    $site = $this->site->all();
    return View::make('partials.site.settings', array(
                                                'site'         => $site,
                                                'settings_nav' => true, 
                                                'admin_dash'   => true
                                              ));

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
        $l->user_total = 0;
        $l->statement_total = 0;
      }
    }
    return View::make('partials.lrs.list', array('lrs'        => $lrs, 
                                                 'lrs_nav'    => true, 
                                                 'admin_dash' => true));

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
    return View::make('partials.users.list', array('users' => $users, 'users_nav' => true, 'admin_dash' => true));

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