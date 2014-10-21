<?php namespace Controllers\API;

use Locker\Repository\Query\QueryRepository as Query;
use Locker\Repository\Report\ReportRepository as Report;
use \Locker\Data\Analytics\AnalyticsInterface as Analytics;

class ReportController extends BaseController {
  protected $report, $query, $analytics, $params, $lrs;

  /**
   * Construct
   *
   * @param StatementRepository $statement
   */
  public function __construct(Report $report, Query $query, Analytics $analytics) {
    $this->report = $report;
    $this->query = $query;
    $this->analytics = $analytics;
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
    $data = json_decode(\LockerRequest::getContent(), true);

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
    $data = json_decode(\LockerRequest::getContent(), true);

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
    return \Response::json($this->report->statements($id));
  }

  /**
   * Runs a report and returns a graph.
   * @param Report $report Report to be ran.
   * @return [Statement] the statements selected by the report.
   */
  public function graph($id) {
    $report = $this->report->find($id);
    $data = $this->analytics->analytics($report->lrs, $report->filter);

    if ($data['success'] == false) {
      return \Response::json([
        'success' => false,
        'message' => \Lang::get('apps.no_data')
      ], 400);
    }

    return \Response::json($data['data']['result']);
  }

}