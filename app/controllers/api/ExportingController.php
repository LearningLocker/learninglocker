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
      \App::abort(404, trans('exporting.errors.notFound', [
        'exportId' => $export_id
      ]));
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
      \App::abort(500, trans('exporting.errors.delete'));
    }
  }

  private function mapExport($export_id, $json = true) {
    $export = $this->get($export_id);

    // Get and check report.
    if (!$this->report->find($export->report)) {
      \App::abort(404, trans('exporting.errors.reportExistence'));
    }

    // Select statements.
    $statements = $this->report->statements($export->report);

    // Get and check fields.
    if(!isset($export->fields)) {
      \App::Abort(400, trans('exporting.errors.noFields'));
    }

    $exporter = $this->exporter;

    // Maps results.
    return function (callable $fn) use ($exporter, $statements, $export, $json) {
      $count = $statements->count();
      $chunk = 1000;
      $taken = 0;

      for ($taken = 0; $taken < $count; $taken += $chunk) {
        $fn($exporter->mapFields(
          $statements->skip($taken)->take($chunk)->get(),
          $export->fields,
          $json
        ), $count, $chunk, $taken + $chunk, $export);
      }
    };
  }

  /**
   * Shows the result of an export as JSON.
   * @param  id $export_id Identifier of the export to be run.
   * @param  json Determines if fields should be json.
   * @return json
   */
  public function show($export_id) {
    $take = $this->mapExport($export_id, true);

    $headers = [
      'Content-Type'=>'application/json'
    ];

    return \Response::stream(function () use ($take) {
      echo '[';
      $take(function ($statements, $count, $chunk, $taken) {
        echo substr(json_encode($statements), 1, -1);
        echo $taken < $count ? ',' : '';
        flush();
        ob_flush();
      });
      echo ']';
    }, 200, $headers);
  }

  /**
   * Shows the result of an export as CSV.
   * @param  id $export_id Identifier of the export to be run.
   * @return csv
   */
  public function showCSV($export_id) {
    // Respond with CSV.
    $take = $this->mapExport($export_id, false);

    $headers = [
      'Content-Type' => 'text/csv'
    ];

    return \Response::stream(function () use ($take) {
      $take(function ($statements, $count, $chunk, $taken, $export) {
        $csv_rows = [];
        $keys = array_keys($statements[0]);

        // Add headers.
        if ($chunk === $taken) {
          array_push($csv_rows, implode(',', $keys));
        } else {
          // Add a newline for next chunk.
          echo "\r\n";
        }

        // Add each mapped result as a row.
        foreach ($statements as $statement) {
          $values = [];

          foreach ($keys as $key) {
            // Decode unicode characters
            array_push($values, json_decode('[' . $statement[$key] . ']', true)[0]);
          }

          // Adds commas between values (for columns);
          array_push($csv_rows, implode(',', $values));
        }

        echo implode("\r\n", $csv_rows);
        flush();
        ob_flush();
      });
    }, 200, $headers);
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