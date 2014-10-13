<?php namespace Controllers\API;

use Locker\Repository\Query\QueryRepository as Query;
use Locker\Repository\Report\ReportRepository as Report;

class ReportController extends BaseController {
  protected $params, $report;

  /**
   * Construct
   *
   * @param StatementRepository $statement
   */
  public function __construct( Report $report ) {
    $this->report = $report;
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
    $reports = $this->report->all($this->lrs->_id);
    return \Response::json($reports);
  }

  /**
   * Creates (POSTs) a new report.
   * @return Report The created report.
   */
  public function store() {
    $data = $this->input();
    $validator = $this->validate($data);

    if ($validator->fails()) {
      return \Response::json(['success'=>false, 'errors'=>$validator->errors() ], 400);
    } else {
      // Adds current LRS.
      $data['lrs'] = $this->lrs->_id;

      // Creates a report.
      $report = $this->report->create($data);
      return \Response::json($report);
    }
  }

  /**
   * Gets a report.
   * @param Report $report Report to be retrieved.
   * @return Report The report with the given id.
   */
  public function show($report) {
    return \Response::json($report);
  }

  /**
   * Updates (PUTs) a report.
   * @param Report $report Report to be updated.
   * @return Report The updated report.
   */
  public function update($report) {
    $data = $this->input();
    $validator = $this->validate($data);

    if ($validator->fails()) {
      return \Response::json(['success'=>false, 'errors'=>$validator->errors() ], 400);
    } else {
      $report->update($data);
      return \Response::json($report);
    }
  }

  /**
   * Deletes a report.
   * @param Report $report Report to be deleted.
   * @return Boolean Success of the deletion.
   */
  public function destroy($report) {
    if ($report->delete()) {
      return \Response::json(['success'=>true]);
    } else {
      return \Response::json(['success'=>false]);
    }
  }

  /**
   * Runs a report.
   * @param Report $report Report to be ran.
   * @return [Statement] the statements selected by the report.
   */
  public function run($report) {

  }

}