<?php namespace Controllers\API;

use Locker\Data\Exporter\Exporter as Exporter;
use Locker\Repository\Query\QueryRepository as Query;
use Locker\Repository\Report\ReportRepository as Report;

class ExportingController extends BaseController {

  /**
   * Filter parameters
   **/
  protected $params;

  protected $exporter, $query, $report;


  /**
   * Construct
   *
   * @param StatementRepository $statement
   */
  public function __construct( Exporter $exporter, Query $query, Report $report ){

    $this->exporter = $exporter;
    $this->query = $query;
    $this->report = $report;
    $this->beforeFilter('@setParameters');
    $this->beforeFilter('@getLrs');

  }


  public function get($report_id) {

    $report = $this->report->find($report_id);
    if( !$report ){
      \App::abort(404, "Report does not exist");
    }
    $statements = $this->query->selectStatementDocs($this->lrs->_id, $this->decodeURL( $report->query ));

    if( !isset($this->params['fields']) ){ //todo - check not empty, check is_array, check meets format requirements
      \App::Abort(400, 'Fields were not supplied');
    }

    $fields = json_decode($this->params['fields'], true);
    $filtered_results = $this->exporter->filter($statements, array_keys($fields));
    $mapped_results = $this->exporter->mapFields($filtered_results, $fields);

    return \Response::json($mapped_results);
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
}