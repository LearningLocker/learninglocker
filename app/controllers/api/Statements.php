<?php namespace Controllers\API;

use \Locker\Repository\Query\QueryRepository as QueryRepository;
use \Locker\Helpers\Exceptions as Exceptions;

class Statements extends Base {
  protected $activity, $query;

  /**
   * Constructs a new StatementController.
   */
  public function __construct(QueryRepository $query) {
    parent::__construct();
    $this->query = $query;
  }

  /**
   * Filters statements using the where method.
   * @return [Statement]
   */
  public function where() {
    $limit = \LockerRequest::getParam('limit', 100);
    $filters = $this->getParam('filters');
    return \Response::json($this->query->where($this->getOptions()['lrs_id'], $filters)->paginate($limit));
  }

  /**
   * Filters statements using the aggregate method.
   * @return Aggregate http://php.net/manual/en/mongocollection.aggregate.php#refsect1-mongocollection.aggregate-examples
   */
  public function aggregate() {
    $pipeline = $this->getParam('pipeline');
    return \Response::json($this->query->aggregate($this->getOptions(), $pipeline));
  }

  /**
   * Aggregates by time.
   * @return Aggregate http://php.net/manual/en/mongocollection.aggregate.php#refsect1-mongocollection.aggregate-examples
   */
  public function aggregateTime() {
    $match = $this->getParam('match');
    return \Response::json($this->query->aggregateTime($this->getOptions(), $match));
  }

  /**
   * Aggregates by object.
   * @return Aggregate http://php.net/manual/en/mongocollection.aggregate.php#refsect1-mongocollection.aggregate-examples
   */
  public function aggregateObject() {
    $match = $this->getParam('match');
    return \Response::json($this->query->aggregateObject($this->getOptions(), $match));
  }

  /**
   * Return raw statements based on filter
   * @param Object $options
   * @return Json $results
   **/
  public function index(){
    $section = json_decode(LockerRequest::getParam('sections', '[]'));

    $data = $this->analytics->statements(
      $this->lrs->_id,
      LockerRequest::getParams(),
      $section
    );

    return $this->returnJson($data);
  }

  /**
   * Inserts new statements based on existing ones in one query using our existing aggregation.
   * @return Json<[String]> Ids of the inserted statements.
   */
  public function insert() {
    $pipeline = $this->getParam('pipeline');
    return \Response::json($this->query->insert($pipeline, $this->getOptions()));
  }

  public function void() {
    $match = $this->getParam('match');
    return \Response::json($this->query->void($match, $this->getOptions()));
  }

  private function getParam($param) {
    $param_value = \LockerRequest::getParam($param);
    $value = json_decode($param_value, true);
    if ($value === null && $param_value === null) {
      throw new Exceptions\Exception("Expected `$param` to be defined as a URL parameter.");
    } else if ($value === null) {
      throw new Exceptions\Exception("Expected the value of `$param` to be valid JSON in the URL parameter.");
    }
    return $value;
  }
}
