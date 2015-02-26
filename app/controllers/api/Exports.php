<?php namespace Controllers\API;

use \Locker\Data\Exporter\Exporter as Exporter;
use \Locker\Repository\Report\Repository as Report;
use \Locker\Repository\Export\Repository as Export;
use \Response as IlluminateResponse;
use \Helpers\Exceptions\NotFound as NotFoundException;

class Exports extends Resources {

  /**
   * Constructs a new Exporting Controller.
   * @param Exporter $exporter Injected export handler.
   * @param Report $report Injected report repository.
   * @param Export $export Injected export repository.
   */
  public function __construct(Exporter $exporter, Report $report, Export $export) {
    $this->exporter = $exporter;
    $this->report = $report;
    $this->repo = $export;
    parent::__construct();
  }

  /**
   * Maps statements using an Export.
   * @param String $id
   * @param Boolean $json Determines if the output should be JSON.
   * @return Statements
   */
  private function mapExport($id, $json = true) {
    $export = $this->repo->show($id, $this->getOptions());
    $statements = $this->report->statements($export->report, $this->getOptions());

    // Maps results.
    return function (callable $fn) use ($statements, $export, $json) {
      $count = $statements->count();
      $chunk = 1000;
      $taken = 0;

      for ($taken = 0; $taken < $count; $taken += $chunk) {
        $fn($this->exporter->mapFields(
          $statements->skip($taken)->take($chunk)->get(),
          $export->fields,
          $json
        ), $count, $chunk, $taken + $chunk, $export);
      }
    };
  }

  /**
   * Shows the result of an export as JSON.
   * @param  id $id Identifier of the export to be run.
   * @param  json Determines if fields should be json.
   * @return json
   */
  public function showJSON($id) {
    try {
      $take = $this->mapExport($id, true);

      $headers = [
        'Content-Type'=>'application/json'
      ];

      return IlluminateResponse::stream(function () use ($take) {
        echo '[';
        $take(function ($statements, $count, $chunk, $taken) {
          echo substr(json_encode($statements), 1, -1);
          echo $taken < $count ? ',' : '';
          flush();
          ob_flush();
        });
        echo ']';
      }, 200, $headers);
    } catch (NotFoundException $ex) {
      return $this->errorResponse($ex, 404);
    }
  }

  /**
   * Shows the result of an export as CSV.
   * @param  id $id Identifier of the export to be run.
   * @return csv
   */
  public function showCSV($id) {
    try {
      // Respond with CSV.
      $take = $this->mapExport($id, false);

      $headers = [
        'Content-Type' => 'text/csv'
      ];

      return IlluminateResponse::stream(function () use ($take) {
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
    } catch (NotFoundException $ex) {
      return $this->errorResponse($ex, 404);
    }
  }
}