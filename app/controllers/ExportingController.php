<?php

use \Locker\Data\Analytics\AnalyticsInterface as Analytics;
use Locker\Repository\Lrs\LrsRepository as Lrs;
use Locker\Repository\Query\QueryRepository as Query;
use Locker\Repository\Report\ReportRepository as Report;

class ExportingController extends \BaseController {

  protected $analytics;
  protected $lrs;
  protected $query;
  protected $export;
  protected $params;

  public function __construct(Analytics $analytics, Lrs $lrs, Query $query, Report $report){
    $this->analytics = $analytics;
    $this->lrs       = $lrs;
    $this->query     = $query;
    $this->export    = $report;
    
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
    $exports  = $this->export->all($id);
    return View::make('partials.exporting.index', [
      'lrs' => $lrs, 
      'list' => $lrs_list,
      'exporting_nav' => true,
      'exports' => $exports
    ]);
  }

  /**
   * Return json feed of reports
   *
   * @return response
   **/
  public function getReports($id, $limit=5){
    $exports = $this->export->all($id);
    return Response::json( $exports );
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

    return View::make('partials.exporting.create', [
      'lrs' => $lrs,
      'list' => $lrs_list,
      'exporting_nav' => true
    ]);
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
    $rules['name']         = 'required';
    $validator = Validator::make($data, $rules);
    if ($validator->fails())  return \Response::json( $validator );

    $save = $this->export->create( $data );

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
    $export   = $this->export->find($export);
    return View::make('partials.exporting.view', [
      'lrs'        => $lrs,
      'list'       => $lrs_list,
      'export'     => $export, 
      'exporting_nav' => true
    ]);
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
   * Remove the specified resource from storage.
   *
   * @param  int  $id
   * @return Response
   */
  public function destroy($id, $export){
    $export = $this->export->delete($export);
    return Redirect::back()->with('success', Lang::get('exporting.deleted')); 
  }

  /**
   * Return available objects for typeahead. Used to search activities 
   * as well as parent and groups id in context.
   * 
   * @return results or empty string
   *
   **/
  public function getTypeahead() {
    return Response::json(['actor']);
  }

  /**
   * Get all of the input and files for the request and store them in params.
   *
   */
  public function setParameters(){
    $this->params = \Request::all();
  }

}