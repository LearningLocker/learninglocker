<?php

use Locker\Repository\Lrs\LrsRepository as Lrs;
use Locker\Repository\Statement\StatementRepository as Statement;
use Locker\Data\Analytics\AnalyticsInterface;

class AnalyticsController extends BaseController {

  /**
  * Lrs 
  */
  protected $lrs;

  /**
  * Analytics
  */
  protected $analytics;

  /**
   * Statements
   **/
  protected $statements;


  /**
   * Construct
   *
   * @param Locker\Repository\Lrs\LrsRepository
   * @param Locker\Data\AnalyticsInterface
   * @param Locker\Repository\StatementRepository
   *
   */
  public function __construct(Lrs $lrs, AnalyticsInterface $analytics, Statement $statement){

    $this->lrs       = $lrs;
    $this->analytics = $analytics;
    $this->statement = $statement;

    $this->beforeFilter('auth');

  }

  /**
   * Display the analytics view.
   *
   * @return View
   */
  public function index( $id, $segment='verbs' ){

    $lrs      = $this->lrs->find( $id );
    $lrs_list = $this->lrs->all();
    $this->analytics->getAnalytics( $id, $segment );
    return View::make('partials.analytics.index', array('lrs'             => $lrs,
                                                        'data'            => $this->analytics->results,
                                                        'line_graph_data' => $this->analytics->data,
                                                        'selected'        => $segment,
                                                        'analytics_nav'   => true,
                                                        'list'            => $lrs_list));

  }



}