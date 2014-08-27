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

  public function __construct(Analytics $analytics, Lrs $lrs, Query $query){
    $this->analytics = $analytics;
    $this->lrs       = $lrs;
    $this->query     = $query;
    
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
    return View::make('partials.exports.index', [
      'lrs' => $lrs, 
      'list' => $lrs_list,
      'exporting_nav' => true
    ]);
  }

  /**
   * Get all of the input and files for the request and store them in params.
   *
   */
  public function setParameters(){
    $this->params = \Request::all();
  }

}