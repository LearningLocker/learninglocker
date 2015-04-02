<?php namespace Controllers\API;

use \Locker\Data\Analytics\AnalyticsInterface as AnalyticsData;
use \LockerRequest as LockerRequest;
use \Locker\Helpers\Exceptions as Exceptions;

class Analytics extends Base {
  protected $analytics;

  /**
   * Constructs a new AnalyticsController.
   * @param Analytics $analytics
   */
  public function __construct(AnalyticsData $analytics) {
    parent::__construct();
    $this->analytics = $analytics;
  }

  // http://docs.learninglocker.net/analytics_api/
  public function index() {
    $data = $this->analytics->analytics($this->lrs->_id, LockerRequest::getParams());

    if ($data['success'] == false) throw new Exceptions\Exception(
      trans('apps.no_data')
    );

    return $this->returnJson($data['data']['result']);
  }
}