<?php namespace Controllers\API;

use \Locker\Repository\Query\QueryRepository as Query;
use \Locker\Repository\Report\Repository as Report;
use \Response as IlluminateResponse;

class Reports extends Resources {

  /**
   * Constructs a new Exporting Controller.
   * @param Report $report Injected report repository.
   * @param Query $query Injected query repository.
   * @param Analytics $analytics Injected analytics repository.
   */
  public function __construct(Report $report, Query $query) {
    parent::__construct();
    $this->repo = $report;
    $this->query = $query;
  }


  /**
   * Runs a report.
   * @param String $id Report to be ran.
   * @return [Statement] Statements selected by the report.
   */
  public function run($id) {
    return IlluminateResponse::json(
      $this->repo->statements($id, $this->getOptions())->lists('statement')
    );
  }

  /**
   * Runs a report and returns a graph.
   * @param String $id Report to be ran.
   * @return [Statement] Statements selected by the report.
   */
  public function graph($id) {
    $report = $this->repo->show($id, $this->getOptions());
    $data = $this->query->aggregateTime($report->lrs, $report->match);
    return IlluminateResponse::json($data['result']);
  }

}