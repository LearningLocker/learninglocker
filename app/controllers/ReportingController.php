<?php

use Locker\Repository\Lrs\LrsRepository as Lrs;
use Locker\Repository\Report\ReportRepository as Report;

class ReportingController extends \BaseController {

  const statementKey = 'statement.';
  protected $analytics, $lrs, $query, $report;
  protected static $segments = [
    'actors' => [
      'return' => 'actor',
      'query' => 'actor.name'
    ],
    'grouping' => [
      'return' => 'context.contextActivities.grouping',
      'query' => 'context.contextActivities.grouping.definition.name.en-GB'
    ],
    'parents' => [
      'return' => 'context.contextActivities.parent',
      'query' => 'context.contextActivities.parent.definition.name.en-GB'
    ],
    'activities' => [
      'return' => 'object',
      'query' => 'object.definition.name.en-GB'
    ],
    'verbs' => [
      'return' => 'verb',
      'query' => 'verb.display.en-GB'
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
   * Displays 
   * @return 
   */
  public function index($id){
    $lrs      = $this->lrs->find($id);
    $lrs_list = $this->lrs->all();
    $reports  = $this->report->all($id);
    return View::make('partials.reporting.index', [
      'lrs' => $lrs, 
      'list' => $lrs_list,
      'reporting_nav' => true,
      'reports' => $reports
    ]);
  }

  /**
   * Gets typeahead values (matching the query) in segments for the current lrs.
   * @param string $lrs LRS in use.
   * @param string $segement Statement segment (i.e. 'verbs').
   * @param query String to match against.
   * @return [Typeahead values] Typeahead values.
   **/
  public function getTypeahead($lrs, $segment, $query){
    $options = self::$segments[$segment];

    return Response::json($this->report->setQuery(
      $lrs,
      $query,
      self::statementKey . $options['return'],
      self::statementKey . $options['query']
    ));
  }

}