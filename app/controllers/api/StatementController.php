<?php namespace Controllers\API;

use \Locker\Data\Analytics\AnalyticsInterface as Analytics;
use \Locker\Repository\Query\QueryRepository as Query;

class StatementController extends BaseController {

  // Defines properties to be set to constructor parameters.
  protected $activity, $query;

  // Defines properties to be set by filters.
  protected $params, $lrs;

  /**
   * Constructs a new StatementController.
   * @param Document $document
   * @param Activity $activity
   */
  public function __construct(Analytics $analytics, Query $query){
    $this->analytics = $analytics;
    $this->query = $query;
    $this->beforeFilter('@setParameters');
    $this->beforeFilter('@getLrs');
  }

  /**
   * Filters statements using the where method.
   * @return [Statement]
   */
  public function where() {
    $limit = \LockerRequest::getParam('limit', 100);
    $filters = json_decode(
      \LockerRequest::getParam('filters'),
      true
    ) ?: [];
    return \Response::json($this->query->where($this->lrs->_id, $filters)->paginate($limit));
  }

  /**
   * Filters statements using the aggregate method.
   * @return Aggregate http://php.net/manual/en/mongocollection.aggregate.php#refsect1-mongocollection.aggregate-examples
   */
  public function aggregate() {
    $pipeline = json_decode(
      \LockerRequest::getParam('pipeline'),
      true
    ) ?: [['match' => []]];
    return \Response::json($this->query->aggregate($this->lrs->_id, $pipeline)); 
  }

  /**
   * Aggregates by time.
   * @return Aggregate http://php.net/manual/en/mongocollection.aggregate.php#refsect1-mongocollection.aggregate-examples
   */
  public function aggregateTime() {
    $match = json_decode(
      \LockerRequest::getParam('match'),
      true
    ) ?: [];
    return \Response::json($this->query->aggregateTime($this->lrs->_id, $match));
  }

  /**
   * Aggregates by object.
   * @return Aggregate http://php.net/manual/en/mongocollection.aggregate.php#refsect1-mongocollection.aggregate-examples
   */
  public function aggregateObject() {
    $match = json_decode(
      \LockerRequest::getParam('match'),
      true
    ) ?: [];
    return \Response::json($this->query->aggregateObject($this->lrs->_id, $match));
  }

  /**
   * Return raw statements based on filter
   *
   * @param Object $options
   * @return Json  $results
   *
   **/
  public function index(){

    //were statement sections passed?
    if( isset( $this->params['sections'] ) ){
      $section = json_decode( $this->params['sections'], true);
      $section = $section;
    }else{
      $section = [];
    }

    $data = $this->analytics->analytics( $this->lrs->_id, $this->params, 'statements', $section );

    if( $data['success'] == false ){
      return $this->returnSuccessError( false, \Lang::get('apps.no_data'), 400 );
    }

    return $this->returnJson( $data['data'] );

  }

}