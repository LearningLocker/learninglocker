<?php namespace Controllers\API;

use \Locker\Data\Analytics\AnalyticsInterface as AnalyticsData;
use \LockerRequest as LockerRequest;

class Analytics extends Base {
  protected $analytics;

  /**
   * Constructs a new AnalyticsController.
   * @param AnalyticsData $analytics
   */
  public function __construct(AnalyticsData $analytics) {
    parent::__construct();
    $this->analytics = $analytics;
  }

  // http://docs.learninglocker.net/analytics_api/
  public function index() {
    $data = $this->analytics->timedGrouping($this->lrs->_id, LockerRequest::getParams());
    return $this->returnJson($data);
  }
}
