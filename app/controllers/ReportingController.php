<?php

use Locker\Repository\Lrs\LrsRepository as Lrs;
use Locker\Repository\Report\Repository as Report;

class ReportingController extends \BaseController {

  const statementKey = 'statement.';
  protected $views = 'partials.reporting';
  protected $analytics, $lrs, $query, $report;
  protected static $segments = [
    'actors' => [
      'return' => 'actor',
      'query' => 'actor.name'
    ],
    'grouping' => [
      'return' => 'context.contextActivities.grouping',
      'query' => 'context.contextActivities.grouping.id'
    ],
    'parents' => [
      'return' => 'context.contextActivities.parent',
      'query' => 'context.contextActivities.parent.id'
    ],
    'activities' => [
      'return' => 'object',
      'query' => 'object.id'
    ],
    'verbs' => [
      'return' => 'verb',
      'query' => 'verb.id'
    ],
    'activityTypes' => [
      'return' => 'object.definition.type',
      'query' => 'object.definition.type'
    ],
    'languages' => [
      'return' => 'context.language',
      'query' => 'context.language'
    ],
    'platforms' => [
      'return' => 'context.platform',
      'query' => 'context.platform'
    ],
    'instructors' => [
      'return' => 'context.instructor',
      'query' => 'context.instructor.name'
    ]
  ];

  public function __construct(Lrs $lrs, Report $report){
    $this->lrs = $lrs;
    $this->report = $report;
    $this->beforeFilter('auth');
    $this->beforeFilter('auth.lrs');
    $this->beforeFilter('csrf', array('only' => array('update', 'store', 'destroy')));
  }

  /**
   * Displays the reporting view.
   * @return reporting view.
   */
  public function index($id){
    $lrs      = $this->lrs->find($id);
    $lrs_list = $this->lrs->all();
    $reports  = $this->report->index([
      'lrs_id' => $id
    ]);
    return View::make("{$this->views}.index", [
      'lrs' => $lrs, 
      'list' => $lrs_list,
      'reporting_nav' => true,
      'reports' => $reports
    ]);
  }

  /**
   * Displays the statements from the report.
   * @return reporting view.
   */
  public function statements($lrsId, $reportId) {
    return View::make("{$this->views}.statements", [
      'lrs' => $this->lrs->find($lrsId), 
      'list' => $this->lrs->all(),
      'reporting_nav' => true,
      'statements' => $this->report->statements($reportId, [
        'lrs_id' => $lrsId
      ])->select('statement')->paginate(20),
      'report' => $this->report->show($reportId, [
        'lrs_id' => $lrsId
      ])
    ]);
  }

  /**
   * Gets typeahead values (matching the query) in segments for the current lrs.
   * @param string $lrs LRS in use.
   * @param string $segement Statement segment (i.e. 'verbs').
   * @param query String to match against.
   * @return [Typeahead values] Typeahead values.
   **/
  public function typeahead($lrs, $segment, $query){
    $options = self::$segments[$segment];

    return Response::json($this->report->setQuery(
      $lrs,
      $query,
      self::statementKey . $options['return'],
      self::statementKey . $options['query']
    ));
  }

}