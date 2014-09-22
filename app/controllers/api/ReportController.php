<?php namespace Controllers\API;

use Locker\Repository\Query\QueryRepository as Query;
use Locker\Repository\Report\ReportRepository as Report;

class ReportController extends BaseController {

  /**
   * Filter parameters
   **/
  protected $params;

  protected $report;

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
   * Gets all of the reports.
   * @return Array of Reports.
   */
  public function getAll() {
    return $this->report->all($this->lrs->_id);
  }

}