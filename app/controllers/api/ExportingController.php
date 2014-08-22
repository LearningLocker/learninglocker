<?php namespace Controllers\API;

use Locker\Data\Exporter\Exporter as Exporter;
use Locker\Repository\Query\QueryRepository as Query;
use Locker\Repository\Report\ReportRepository as Report;
use Locker\Repository\Export\ExportRepository as Export;

class ExportingController extends BaseController {

  /**
   * Filter parameters
   **/
  protected $params;

  protected $exporter, $query, $report, $export;


  /**
   * Construct
   *
   * @param StatementRepository $statement
   */
  public function __construct( Exporter $exporter, Query $query, Report $report, Export $export ) {

    $this->exporter = $exporter;
    $this->query = $query;
    $this->report = $report;
    $this->export = $export;
    $this->beforeFilter('@setParameters');
    $this->beforeFilter('@getLrs');

  }

  /**
   * Gets an export.
   * @param  id $export_id Identifier of the export to be retrieved.
   * @return Export The retrieved export.
   */
  public function get($export_id) {
    return $this->export->find($export_id);
  }

  /**
   * Creates an export.
   * @return id Identifer of the created export.
   */
  public function create() {
    return $this->export->create($this->params);
  }

  /**
   * Updates an export.
   * @param  id $export_id Identifier of the export to be updated.
   * @return boolean Success of the update.
   */
  public function update($export_id) {
    
  }

  /**
   * Deletes an export.
   * @param  id $export_id Identifier of the export to be delete.
   * @return boolean Success of the deletion.
   */
  public function destroy($export_id) {
    return $this->export->delete($export_id);
  }


  /**
   * Runs an export.
   * @param  id $report_id Identifier of the report to run.
   * @return response Mapped statements in JSON. 
   */
  public function run($report_id) {

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