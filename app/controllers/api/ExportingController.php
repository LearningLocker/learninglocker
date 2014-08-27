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
   * Gets all exports.
   * @return Array of Exports
   */
  public function getAll() {
    return $this->export->all($this->lrs->_id);
  }

  /**
   * Gets an export.
   * @param  id $export_id Identifier of the export to be retrieved.
   * @return Export The retrieved export.
   */
  public function get($export_id) {
    $export = $this->export->find($export_id);
    if ($export['exists']) {
      return $export;
    } else {
      \App::abort(404, "Export with id `" . $export_id . "` not found.");
    }
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
    return $this->export->update($export_id, $this->params);
  }

  /**
   * Deletes an export.
   * @param  id $export_id Identifier of the export to be delete.
   * @return boolean Success of the deletion.
   */
  public function destroy($export_id) {
    if ($this->export->delete($this->get($export_id))) {
      \Response::json(['ok'], 204);
    } else {
      \App::abort(500, 'Could not delete report.');
    }
  }

  /**
   * Shows the result of an export as JSON.
   * @param  id $export_id Identifier of the export to be run.
   * @return json
   */
  public function show($export_id) {
    $export = $this->get($export_id);

    // Get and check report.
    $report = $this->report->find($export->report);
    if( !$report ){
      \App::abort(404, "Report does not exist");
    }

    // Select statements.
    $statements = $this->query->selectStatementDocs(
      $this->lrs->_id,
      $this->decodeURL($report->query)
    );

    // Get and check fields.
    if(is_null($export['fields'])) {
      \App::Abort(400, 'Fields were not supplied');
    }

    // Filter and map results.
    $filtered_results = $this->exporter->filter($statements, $export['fields']);
    $mapped_results = $this->exporter->mapFields($filtered_results, $export['fields']);

    // Return mapped results and json.
    return $mapped_results;
  }

  /**
   * Shows the result of an export as CSV.
   * @param  id $export_id Identifier of the export to be run.
   * @return csv
   */
  public function showCSV($export_id) {
    $csv_rows = [];

    // Get mapped results.
    $mapped_results = $this->show($export_id);

    // Add fields.
    $keys = array_keys($mapped_results[0]);
    array_push($csv_rows, implode(',', $keys));

    // Add each mapped result as a row.
    foreach ($mapped_results as $result) {
      $values = [];

      foreach ($keys as $key) {
        array_push($values, $result[$key]);
      }

      array_push($csv_rows, implode(',', $values));
    }

    // Respond with CSV.
    $headers = [
      'Content-Type' => 'text/csv'
    ];
    return \Response::make(implode('\n', $csv_rows), 200, $headers);
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