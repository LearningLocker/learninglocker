<?php

use Locker\Repository\Site\SiteRepository as SiteRepo;
use Locker\Repository\Lrs\Repository as LrsRepo;
use Locker\Repository\Statement\Repository as StatementRepo;
use Locker\Repository\User\UserRepository as UserRepo;

class SiteController extends BaseController {

  protected $site, $lrs, $user, $statement;

  /**
   * Constructs a new SiteController.
   */
  public function __construct(SiteRepo $site, LrsRepo $lrs, UserRepo $user, StatementRepo $statement){
    $this->site = $site;
    $this->lrs  = $lrs;
    $this->statement  = $statement;
    $this->user = $user;

    $this->beforeFilter('auth');
    $this->beforeFilter('auth.super', array('except' => array('inviteUsers')));
    $this->beforeFilter('csrf', array('only' => array('update', 'verifyUser', 'inviteUsers')));
  }

  /**
   * Display a listing of statements for a user.
   *
   * @return View
   */
  public function index(){
    $site  = $this->site->all();
    $opts = ['user' => \Auth::user()];
    $list  = $this->lrs->index($opts);
    $admin_dashboard = new \app\locker\data\dashboards\AdminDashboard();

    return View::make('partials.site.dashboard', [
      'site' => $site,
      'list' => $list,
      'stats' => $admin_dashboard->getFullStats(),
      'graph_data' => $admin_dashboard->getGraphData()
    ]);

  }

  /**
   * Show the form for editing the specified resource.
   * @param String $id
   * @return View
   */
  public function edit($id){
    $site = $this->site->find($id);
    return View::make('partials.site.edit', [
      'site' => $site,
      'settings_nav' => true
    ]);
  }

  /**
   * Update the specified resource in storage.
   * @param String $id
   * @return View
   */
  public function update($id) {
    $s = $this->site->update($id, Input::all());

    if ($s) {
      return Redirect::back()->with('success', trans('site.updated'));
    }

    return Redirect::back()
      ->withInput()
      ->withErrors($user->errors());
  }

  /**
   * Display the super admin settings.
   * @return Response
   */
  public function settings() {
    return Response::json($this->site->all());
  }

  /**
   * Grab site stats
   * @return Response
   **/
  public function getStats() {
    $startDate = \LockerRequest::getParam('graphStartDate');
    $endDate = \LockerRequest::getParam('graphEndDate');

    $startDate = !$startDate ? null : new \Carbon\Carbon($startDate);
    $endDate = !$endDate ? null : new \Carbon\Carbon($endDate);
    $admin_dashboard = new \app\locker\data\dashboards\AdminDashboard();
    $stats = $admin_dashboard->getFullStats();

    return Response::json($stats);
  }


  /**
   * Grab site stats
   * @return Response
   **/
  public function getGraphData(){
    $startDate = \LockerRequest::getParam('graphStartDate');
    $endDate = \LockerRequest::getParam('graphEndDate');

    $startDate = !$startDate ? null : new \Carbon\Carbon($startDate);
    $endDate = !$endDate ? null : new \Carbon\Carbon($endDate);
    $admin_dashboard = new \app\locker\data\dashboards\AdminDashboard();
    $graph_data = $admin_dashboard->getGraphData($startDate, $endDate);
    return Response::json($graph_data);
  }

  /**
   * Display the super admin lrs view.
   * @return Response
   */
  public function lrs(){
    $opts = ['user' => \Auth::user()];
    $lrss = $this->lrs->index($opts);

    return Response::json(array_map(function ($lrs) {
      $lrs->statement_total = $this->statement->count(['lrs_id' => $lrs->_id, 'scopes' => ['all']]);
      return $lrs;
    }, $lrss));
  }

  public function apps() {
    return OAuthApp::all();
  }

  /**
   * Display the super admin user list view.
   * @return Response
   */
  public function users() {
    return Response::json($this->user->all()->map(function ($user) {
      $user->lrs_owned  = $this->lrs->getLrsOwned($user->_id);
      $user->lrs_member = $this->lrs->getLrsMember($user->_id);
      return $user;
    }));
  }

  /**
   * Display the invite user page
   * @return Response
   */
  public function inviteUsersForm() {
    return View::make('partials.site.invite', [
      'users_nav' => true,
      'admin_dash' => true
    ]);
  }

  /**
   * Invite in the users
   **/
  public function inviteUsers() {
    $invite = \Locker\Helpers\User::inviteUser(Input::all());
    return Redirect::back()->with('success', trans('users.invite.invited'));
  }

  /**
   * Verify a user.
   **/
  public function verifyUser($id) {
    $verify = $this->site->verifyUser($id);
    return Response::json($verify);
  }
}
