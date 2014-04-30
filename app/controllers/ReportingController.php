<?php

use \Locker\Data\Analytics\AnalyticsInterface as Analytics;
use Locker\Repository\Lrs\LrsRepository as Lrs;
use Locker\Repository\Query\QueryRepository as Query;
use Locker\Repository\Report\ReportRepository as Report;

class ReportingController extends \BaseController {

  /**
  * Analytics Interface
  */
  protected $analytics;

  /**
   * Lrs
   **/
  protected $lrs;

  /**
   * Query interface
   **/
  protected $query;

  /**
   * Report interface
   **/
  protected $report;

  /** 
   * Lrs
   **/

  /**
   * Filter parameters
   **/
  protected $params;

  public function __construct(Analytics $analytics, Lrs $lrs, Query $query, Report $report){

    $this->analytics = $analytics;
    $this->lrs       = $lrs;
    $this->query     = $query;
    $this->report    = $report;
    
    $this->beforeFilter('auth');
    $this->beforeFilter('auth.lrs'); //check user can access LRS.
    $this->beforeFilter('csrf', array('only' => array('update', 'store', 'destroy')));
    $this->beforeFilter('@setParameters');
  }

  /**
   * Display a listing of the resource.
   *
   * @return Response
   */
  public function index($id){
    $lrs      = $this->lrs->find( $id );
    $lrs_list = $this->lrs->all();
    $reports  = $this->report->all($id);
    return View::make('partials.reporting.index', array('lrs' => $lrs, 
      'list' => $lrs_list, 'reporting_nav' => true, 'reports' => $reports));
  }

  /**
   * Return json feed of reports
   *
   * @return response
   **/
  public function getReports($id, $limit=5){
    $reports = $this->report->all($id);
    return Response::json( $reports );
  }

  /**
   * Show the form for creating a new report.
   *
   * @param string $id Lrs ID
   * @return Response
   */
  public function create($id){

    $lrs      = $this->lrs->find( $id );
    $lrs_list = $this->lrs->all();
    $verbs    = new \app\locker\data\reporting\getVerbs();
    $activities = new \app\locker\data\reporting\getActivities();
    $activities = $activities->getActivities( $id );
    $context = new \app\locker\data\reporting\getContext();
    return View::make('partials.reporting.create', array('lrs'           => $lrs,
                                                         'verbs'         => $verbs->getVerbs( $id ),
                                                         'languages'     => $context->getContextLanguages( $id ),
                                                         'platforms'     => $context->getContextPlatforms( $id ),
                                                         'instructors'   => $context->getContextInstructors( $id ),
                                                         'activity_type' => $activities,
                                                         'reporting_nav' => true,
                                                         'list'          => $lrs_list));
  }

  /**
   * Store a newly created resource in storage.
   *
   * @return Response
   */
  public function store(){

    $request  = \Request::instance();
    $incoming = $request->getContent();
    $data     = json_decode($incoming, true);

    //lrs input validation
    $rules['name']         = 'required|alpha_spaces';
    $rules['description']  = 'alpha_spaces';       
    $validator = Validator::make($data, $rules);
    if ($validator->fails())  return \Response::json( $validator );

    $save = $this->report->create( $data );

    if( $save ){
      return \Response::json( 'success' );
    }

    return \Response::json( 'error' );
  }

  /**
   * Display the specified resource.
   *
   * @param  int  $id
   * @return Response
   */
  public function show($id, $report){

    $lrs      = $this->lrs->find($id);
    $lrs_list = $this->lrs->all();
    $report   = $this->report->find($report);
    $statements = $this->getStatements($id, $this->decodeURL( $report->query ));
    return View::make('partials.reporting.view', array('lrs'        => $lrs,
                                                       'list'       => $lrs_list,
                                                       'statements' => $statements,
                                                       'report'     => $report, 
                                                       'reporting_nav' => true));

  }

  /**
   * Loop through saved report query and decode any url's
   *
   **/
  public function decodeURL($array){

    $output = '';

    if( !empty($array) ){
      foreach($array as $key => $value){
        if(is_array($value)){
          $output[$key] = $this->decodeURL( $value );
        }else{
          $output[$key] = urldecode($value);
        }
      }
    }

    return $output;

  }

  /**
   * Show the form for editing the specified resource.
   *
   * @param  int  $id
   * @return Response
   */
  public function edit($id)
  {
    //
  }

  /**
   * Update the specified resource in storage.
   *
   * @param  int  $id
   * @return Response
   */
  public function update($id)
  {
    //
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param  int  $id
   * @return Response
   */
  public function destroy($id, $report){
    $report = $this->report->delete($report);
    return Redirect::back()->with('success', Lang::get('reporting.deleted')); 
  }

  /** 
   * Get data based on query created.
   **/
  public function getData($lrs, $data=''){

    $data = $this->analytics->analytics( $lrs, $data );

    if( $data['success'] == false ){
      return \Response::json( array( 'success'  => false, 'message'  => \Lang::get('apps.no_data')), 400 );
    }

    return \Response::json( $data['data']['result'] );
  }

  /**
   * Return statements based on query created
   **/
  public function getStatements($lrs, $filter=''){

    return $this->query->selectStatements( $lrs, $filter );
    return \Response::json( $getStatements );

  }

  /**
   * Get available actors to use with typeahead.
   **/
  public function getActors($lrs, $query){
    $results = $this->report->getActors($lrs, $query);
    return Response::json($results);
  }

  /**
   * Get available activities to use with typeahead.
   **/
  public function getActivities($lrs, $query){
    $results = $this->setQuery($lrs, $query, 'statement.object', 'statement.object.id');
    return Response::json($results);
  }

  /**
   * Get available parent activities to use with typeahead.
   **/
  public function getParents($lrs, $query){
    $results = $this->setQuery($lrs, $query, 'statement.context.contextActivities.parent', 'statement.context.contextActivities.parent.id');
    return Response::json($results);
  }

  /**
   * Get available grouping activities to use with typeahead.
   **/
  public function getGrouping($lrs, $query){
    $results = $this->setQuery($lrs, $query, 'statement.context.contextActivities.grouping', 'statement.context.contextActivities.grouping.id');
    return Response::json($results);
  }

  public function setQuery($lrs, $query, $field, $wheres){
    return $this->report->setQuery($lrs, $query, $field, $wheres);
  }

  /**
   * Get all of the input and files for the request and store them in params.
   *
   */
  public function setParameters(){
    $this->params = \Request::all();
  }

}