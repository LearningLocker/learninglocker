<?php namespace Controllers\API;

use Locker\Data\Exporter\Exporter as Exporter;
use Locker\Repository\Report\ReportRepository as Report;
use Locker\Repository\Export\Repository as Export;
use \Helpers\Exceptions\NotFound as NotFoundException;

class ExportingController extends BaseController {

  /**
   * Filter parameters
   **/
  protected $params;

  protected $exporter, $report, $export;


  /**
   * Construct
   *
   * @param StatementRepository $statement
   */
  public function __construct( Exporter $exporter, Report $report, Export $export ) {

    $this->exporter = $exporter;
    $this->report = $report;
    $this->export = $export;
    $this->beforeFilter('@setParameters');
    $this->beforeFilter('@getLrs');

  }

  /**
   * Gets all exports.
   * @return Array of Exports
   */
  public function index() {
    return \Response::json($this->export->index([
      'lrs_id' => $this->lrs->_id
    ]), 200);
  }

  /**
   * Gets an export.
   * @param  id $export_id Identifier of the export to be retrieved.
   * @return Export The retrieved export.
   */
  public function show($export_id) {
    try {
      return \Response::json($this->export->show($export_id, [
        'lrs_id' => $this->lrs->_id
      ]), 200);
    } catch (NotFoundException $ex) {
      \App::abort(404, $ex->message);
    }
  }

  /**
   * Creates an export.
   * @return id Identifer of the created export.
   */
  public function store() {
    return \Response::json($this->export->store($this->params, [
      'lrs_id' => $this->lrs->_id
    ]), 200);
  }

  /**
   * Updates an export.
   * @param  id $export_id Identifier of the export to be updated.
   * @return boolean Success of the update.
   */
  public function update($export_id) {
    try {
      return \Response::json($this->export->update($export_id, $this->params, [
        'lrs_id' => $this->lrs->_id
      ]), 200);
    } catch (NotFoundException $ex) {
      \App::abort(404, $ex->message);
    }
  }

  /**
   * Deletes an export.
   * @param  id $export_id Identifier of the export to be delete.
   * @return boolean Success of the deletion.
   */
  public function destroy($export_id) {
    try{
      return \Response::json($this->export->destroy($export_id, [
        'lrs_id' => $this->lrs->_id
      ]), 204);
    } catch (NotFoundException $ex) {
      \App::abort(404, $ex->message);
    }
  }

  private function mapExport($export_id, $json = true) {
    $export = $this->export->show($export_id, [
      'lrs_id' => $this->lrs->_id
    ]);

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
  public function showJSON($export_id) {
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
        }

        // Add each mapped result as a row.
        foreach ($statements as $statement) {
          $values = [];

          foreach ($keys as $key) {
            array_push($values, $statement[$key]);
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
}