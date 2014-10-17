<?php namespace Controllers\API;

use Locker\Repository\Query\QueryRepository as Query;
use Locker\Repository\Report\ReportRepository as Report;

class ReportController extends BaseController {
  protected $report, $query, $params, $lrs;

  /**
   * Construct
   *
   * @param StatementRepository $statement
   */
  public function __construct(Report $report, Query $query) {
    $this->report = $report;
    $this->query = $query;
    $this->beforeFilter('@setParameters');
    $this->beforeFilter('@getLrs');
  }

  /**
   * Gets accepted fields from the input.
   * @return AssocArray The accepted fields.
   */
  private function input() {
    return \Input::only('lrs', 'query', 'name', 'description');
  }

  /**
   * Validates the given data.
   * @param  AssocArray $data The data to be validated.
   * @return Validator The validator used to validate the data.
   */
  private function validate($data) {
    return \Validator::make($data, \Report::$rules);
  }

  /**
   * Gets all reports.
   * @return [Report] Array of reports that have been stored.
   */
  public function index() {
    return \Response::json($this->report->all($this->lrs->_id));
  }

  /**
   * Creates (POSTs) a new report.
   * @return Report The created report.
   */
  public function store() {
    $data = $this->input();

    try {
      // Adds current LRS.
      $data['lrs'] = $this->lrs->_id;
      return \Response::json($this->report->create($data));
    } catch (Exception $exception) {
      return \Response::json([
        'success' => false,
        'errors' => $this->report->$validator->errors(),
        'message' => $exception->getMessage()
      ], 400);
    }
  }

  /**
   * Gets a report.
   * @param Report $report Report to be retrieved.
   * @return Report The report with the given id.
   */
  public function show($id) {
    return \Response::json($this->report->find($id));
  }

  /**
   * Updates (PUTs) a report.
   * @param Report $report Report to be updated.
   * @return Report The updated report.
   */
  public function update($id) {
    $data = $this->input();

    try {
      return \Response::json($this->report->update($id, $data));
    } catch (Exception $exception) {
      return \Response::json([
        'success' => false,
        'errors' => $this->report->$validator->errors(),
        'message' => $exception->getMessage()
      ], 400);
    }
  }

  /**
   * Deletes a report.
   * @param Report $report Report to be deleted.
   * @return Boolean Success of the deletion.
   */
  public function destroy($id) {
    return \Response::json([
      'success' => $this->report->delete($id)
    ]);
  }

  /**
   * Runs a report.
   * @param Report $report Report to be ran.
   * @return [Statement] the statements selected by the report.
   */
  public function run($id) {
    $report = $this->report->find($id);
    return \Response::json($this->query->selectStatements(
      $report->lrs,
      $this->decodeURL($report->query),
      true
    ));
  }

  /**
   * Decodes all URLs in array values.
   * @param Array $array
   * @return Array with all URLs decoded.
   */
  public function decodeURL($array) {
    $output = '';

    if (!empty($array)) {
      foreach ($array as $key => $value) {
        if (is_array($value)) {
          $output[$key] = $this->decodeURL($value);
        } else {
          $output[$key] = urldecode($value);
        }
      }
    }

    return $output;
  }

}