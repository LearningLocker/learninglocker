<?php

use Locker\Repository\Lrs\LrsRepository as Lrs;
use Locker\Repository\Statement\StatementRepository as Statement;
use Locker\Data\Analytics\AnalyticsInterface;

class LrsController extends BaseController {

  /**
  * Lrs 
  */
  protected $lrs;

  /**
  * Analytics
  */
  protected $analytics;

  /**
   * Statements
   **/
  protected $statements;


  /**
   * Construct
   *
   * @param Locker\Repository\Lrs\LrsRepository
   * @param Locker\Data\AnalyticsInterface
   * @param Locker\Repository\StatementRepository
   *
   */
  public function __construct(Lrs $lrs, AnalyticsInterface $analytics, Statement $statement){

    $this->lrs       = $lrs;
    $this->analytics = $analytics;
    $this->statement = $statement;

    $this->beforeFilter('auth');
    $this->beforeFilter('csrf', array('on' => array('store', 'update')));
    $this->beforeFilter('auth.lrs', array('except' => array('index','create','store'))); //check user can access LRS.
    $this->beforeFilter('create.lrs', array('only' => 'create')); //Allowed to create an LRS?

  }

  /**
   * Display a listing of LRSs available for user.
   *
   * @return View
   */
  public function index(){
    $lrs = $this->lrs->all();
    return View::make('partials.lrs.list', array('lrs' => $lrs));
  }

  /**
   * Show the form for creating a new resource.
   *
   * @return View
   */
  public function create(){
    //has the user verified their email address?
    $verified = Auth::user()->verified;
    return View::make('partials.lrs.create', array('verified' => $verified));
  }

  /**
   * Store a newly created resource in storage.
   *
   * @return View
   */
  public function store(){

    $data = Input::all();

    //lrs input validation
    $rules['title']        = 'required|alpha_spaces';
    $rules['description']  = 'alpha_spaces';       
    $validator = Validator::make($data, $rules);
    if ($validator->fails()) return Redirect::back()->withErrors($validator);

    // Store lrs
    $s = $this->lrs->create( $data );

    if($s){
      return Redirect::to('/lrs')->with('success', Lang::get('lrs.created'));
    }

    return Redirect::back()
      ->withInput()
      ->with('error', Lang::get('create_problem'));
  }

  /**
   * Show the form for editing the specified resource.
   *
   * @param  int  $id
   * @return View
   */
  public function edit( $id ){

    $lrs      = $this->lrs->find( $id );
    $lrs_list = $this->lrs->all();
    return View::make('partials.lrs.edit', array('account_nav' => true, 
                                                 'lrs'         => $lrs, 
                                                 'list'        => $lrs_list));

  }

  /**
   * Update the specified resource in storage.
   *
   * @param  int  $id
   * @return View
   */
  public function update($id){

    //lrs input validation
    $rules['title']        = 'required|alpha_spaces';
    $rules['description']  = 'alpha_spaces';       
    $validator = Validator::make($data, $rules);
    if ($validator->fails()) return Redirect::back()->withErrors($validator);

    $l = $this->lrs->update( $id, Input::all() );

    if($l){
      return Redirect::back()->with('success', Lang::get('lrs.updated'));
    }

    return Redirect::back()
          ->withInput()
          ->withErrors($this->lrs->errors());

  }

  /**
   * Display the specified resource.
   *
   * This is a temp hack until the single page app for 
   * analytics is ready. v1.0 stable.
   *
   * @param  int  $id
   * @return View
   */
  public function show( $id ){

    $lrs      = $this->lrs->find( $id );
    $lrs_list = $this->lrs->all();
    $site     = \Site::first();
    return View::make('partials.lrs.dashboard', array('lrs'      => $lrs, 
                                                      'list'     => $lrs_list,
                                                      'site'     => $site,
                                                      'dash_nav' => true));
  }

  public function getStats( $id, $segment = '' ){

    $stats = new \app\locker\data\dashboards\LrsDashboard( $id );

    switch( $segment ){
      case 'topActivities':
        $get_stats = $stats->getTopActivities( $id );
        $get_stats = $get_stats['result'];
        break;
      case 'activeUsers':
        $get_stats = $stats->getActiveUsers( $id );
        $get_stats = $get_stats['result'];
        break;
      default:
        $get_stats = $stats->setTimelineGraph();
        break;
    }
    return Response::json($get_stats);
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param  int  $id
   * @return View
   */
  public function destroy($id){

    $this->lrs->delete($id);
    return Response::json(array('success'=>200, 'message'=>'deleted'));
    //return Redirect::back()->with('success', Lang::get('lrs.deleted'));

  }

  /**
   * Display statements for this LRS
   *
   * @return View
   */
  public function statements( $id ){

    $statements = $this->statement->statements($id);
    $lrs        = $this->lrs->find( $id );
    $lrs_list   = $this->lrs->all();
    return View::make('partials.statements.list', 
                  array('statements'    => $statements,
                        'lrs'           => $lrs,
                        'list'          => $lrs_list,
                        'statement_nav' => true));

  }

  /**
   * Display the endpoint view.
   *
   * @return View
   */
  public function endpoint( $id ){

    $lrs    = $this->lrs->find( $id );
    $lrs_list = $this->lrs->all();
    return View::make('partials.lrs.endpoint', array('lrs'          => $lrs, 
                                                     'endpoint_nav' => true,
                                                     'list'         => $lrs_list));

  }

  /**
   * Display the api view.
   *
   * @return View
   */
  public function api( $id ){

    $lrs      = $this->lrs->find( $id );
    $lrs_list = $this->lrs->all();
    return View::make('partials.lrs.api', array('lrs'     => $lrs, 
                                                'api_nav' => true,
                                                'list'    => $lrs_list));

  }

  /**
   * Generate a new key and secret for basic auth
   *
   **/
  public function editCredentials( $id ){

    $lrs = $this->lrs->find( $id );

    $lrs->api  = array('basic_key'    => \app\locker\helpers\Helpers::getRandomValue(),
                       'basic_secret' => \app\locker\helpers\Helpers::getRandomValue());

    if( $lrs->save() ){
      $message_type = 'success';
      $message      = Lang::get('update_key');
    }else{
      $message_type = 'error';
      $message      = Lang::get('update_key_error');
    }
    
    return Redirect::back()->with($message_type, $message);
    
  }

  /**
   * Display users with access to this lrs.
   *
   * @return View
   */
  public function users( $id ){

    $lrs      = $this->lrs->find( $id );
    $lrs_list = $this->lrs->all();
    return View::make('partials.users.list', array('lrs'      => $lrs, 
                                                   'users'    => $lrs->users,
                                                   'list'     => $lrs_list,
                                                   'user_nav' => true));

  }

  public function inviteUsersForm( $id ){
    $lrs      = $this->lrs->find( $id );
    $lrs_list = $this->lrs->all();
    return View::make('partials.lrs.invite', array('lrs'      => $lrs, 
                                                   'users'    => $lrs->users,
                                                   'list'     => $lrs_list,
                                                   'user_nav' => true));

  }

  public function usersRemove( $id ){
    $lrs = $this->lrs->removeUser( $id, Input::get('user') );
    return Redirect::back()->with('success', Lang::get('lrs.remove_user'));
  }

}