<?php namespace Controllers\API;

use \Locker\Data\Exporter\Exporter as Exporter;
use \Locker\Repository\Report\Repository as Report;
use \Locker\Repository\Export\Repository as Export;
use \Response as IlluminateResponse;
use \Helpers\Exceptions\NotFound as NotFoundException;

class Exports extends Resources {
  const CSV_DELIMITER = ',';
  const CSV_ENCLOSURE = '"';

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
   * Exports statements as JSON.
   * @param String $id Export's ID.
   * @return StreamedResponse.
   */
  public function showJson($id) {
    try {
      $opts = $this->getOptions();
      $model = $this->repo->show($id, $opts);

      return IlluminateResponse::stream(function () use ($model, $opts) {
        echo '[';
        $this->repo->export($model, array_merge($opts, [
          'next' => function () {
            echo ',';flush();ob_flush();
          },
          'stream' => function ($obj) {
            echo json_encode($obj);
          }
        ]));
        echo ']';
      }, 200);
    } catch (NotFoundException $ex) {
      return $this->errorResponse($ex, 404);
    }
  }

  /**
   * Exports statements as CSV.
   * @param String $id Export's ID.
   * @return StreamedResponse.
   */
  public function showCsv($id) {
    try {
      $opts = $this->getOptions();
      $model = $this->repo->show($id, $opts);

      return IlluminateResponse::stream(function () use ($model, $opts) {
        // Outputs the field names (column headers).
        echo implode(',', array_map(function ($field) {
          return $field['to'];
        }, $model->fields))."\n";

        // Outputs the statements (rows).
        $this->repo->export($model, array_merge($opts, [
          'next' => function () {
            echo "\n";flush();ob_flush();
          },
          'stream' => function ($obj) {
            // Outputs the field values (column values).
            echo implode(',', array_map(function ($value) {
              return $this->quoteCSV($value);flush();ob_flush();
            }, $obj));
          }
        ]));
      }, 200);
    } catch (NotFoundException $ex) {
      return $this->errorResponse($ex, 404);
    }
  }

  /**
   * Adds quotes to a comma separated value.
   * http://stackoverflow.com/questions/3933668/convert-array-into-csv
   * @param String $field The field to be quoted.
   * @return String The correctly quoted field.
   */
  private function quoteCSV($field) {
    if (!is_scalar($field)) {
      $field = json_encode($field);
    }
    $delimiter_esc = preg_quote(self::CSV_DELIMITER, '/');
    $enclosure_esc = preg_quote(self::CSV_ENCLOSURE, '/');
    if (preg_match("/(?:${delimiter_esc}|${enclosure_esc}|\s)/", $field)) {
      return self::CSV_ENCLOSURE . str_replace(
        self::CSV_ENCLOSURE,
        self::CSV_ENCLOSURE . self::CSV_ENCLOSURE,
        $field
      ) . self::CSV_ENCLOSURE;
    } else {
      return $field;
    }
  }
}
