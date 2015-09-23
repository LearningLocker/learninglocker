<?php

use Locker\Repository\Lrs\Repository as LrsRepo;
use Locker\Repository\Report\Repository as ReportRepo;

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

  public function __construct(LrsRepo $lrs, ReportRepo $report){
    $this->lrs = $lrs;
    $this->report = $report;
    $this->beforeFilter('auth');
    $this->beforeFilter('auth.lrs');
    $this->beforeFilter('csrf', array('only' => array('update', 'store', 'destroy')));
  }

  private function getLrs($lrs_id) {
    $opts = ['user' => \Auth::user()];
    return [
      'lrs' => $this->lrs->show($lrs_id, $opts),
      'list' => $this->lrs->index($opts)
    ];
  }

  /**
   * Displays the reporting view.
   * @param String $lrs_id
   * @return reporting view.
   */
  public function index($lrs_id) {
    $site = \Site::first();
    return View::make("{$this->views}.index", array_merge($this->getLrs($lrs_id), [
      'reporting_nav' => true,
      'reports' => $this->report->index([
        'lrs_id' => $lrs_id
      ]),
      'client' => (new \Client)->where('lrs_id', $lrs_id)->first(),
      'lang' => $site->lang
    ]));
  }

  /**
   * Displays the statements from the report.
   * @param String $lrs_id
   * @param String $report_id
   * @return reporting view.
   */
  public function statements($lrs_id, $report_id) {
    $site = \Site::first();
    return View::make("{$this->views}.statements", array_merge($this->getLrs($lrs_id), [
      'reporting_nav' => true,
      'statements' => $this->report->statements($report_id, [
        'lrs_id' => $lrs_id
      ])->select('statement')->paginate(20),
      'report' => $this->report->show($report_id, [
        'lrs_id' => $lrs_id
      ]),
      'lang' => $site->lang
    ]));
  }

  /**
   * Gets typeahead values (matching the query) in segments for the current lrs.
   * @param String $lrs LRS in use.
   * @param String $segement Statement segment (i.e. 'verbs').
   * @param String $query to match against.
   * @return [Typeahead values] Typeahead values.
   **/
  public function typeahead($lrs_id, $segment, $query){
    $options = self::$segments[$segment];
    return Response::json($this->report->setQuery(
      $lrs_id,
      $query,
      self::statementKey.$options['return'],
      self::statementKey.$options['query']
    ));
  }

}
