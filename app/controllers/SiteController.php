<?php

use Locker\Repository\Site\SiteRepository as Site;
use Locker\Repository\Lrs\LrsRepository as Lrs;
use Locker\Repository\Statement\StatementRepository as Statement;
use Locker\Repository\User\UserRepository as User;

class SiteController extends BaseController {

  /**
  * Site
  */
  protected $site;

  /**
   * Lrs
   **/
  protected $lrs;

  /**
   * $user
   **/
  protected $user;

  /**
   * Statements
   **/
  protected $statement;


  /**
   * Construct
   *
   * @param Site $site
   */
  public function __construct(Site $site, Lrs $lrs, User $user, Statement $statement){

    $this->site = $site;
    $this->lrs  = $lrs;
    $this->statement  = $statement;
    $this->user = $user;

    //$this->beforeFilter('auth');
    $this->beforeFilter('auth.super');
    $this->beforeFilter('csrf', array('only' => array('update', 'verifyUser', 'inviteUsers'))); 

  }

  /**
   * Display a listing of statements for a user.
   *
   * @return View
   */
  public function index(){

    $site  = $this->site->all();
    $list  = $this->lrs->all();
    return View::make('partials.site.dashboard', array('site' => $site, 'list' => $list));

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

    $lrs = $this->lrs->all();
    if( $lrs ){
      foreach( $lrs as $l ){
        $l->statement_total = $this->statement->count($l->_id);
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

    $users = $this->user->all();
    foreach($users as &$u){
      $u->lrs_owned  = $this->lrs->getLrsOwned( $u->_id );
      $u->lrs_member = $this->lrs->getLrsMember( $u->_id );
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
    return Redirect::back()->with('success', Lang::get('users.invite.invited'));
  }

  /**
   * Verify a user.
   **/
  public function verifyUser($id){
    $verify = $this->site->verifyUser($id);
    return Response::json($verify);
  }

}