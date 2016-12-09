<?php namespace Controllers\API;

use Config;
use Carbon\Carbon;
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
    $pipeline = $this->getPipeline();
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

  private function createMongoDate($date) {
    $parsedDate = new Carbon($date);
    if($parsedDate) return new \MongoDate($parsedDate->timestamp, $parsedDate->micro);
    else throw new Exceptions\Exception("`$date` is not a valid date.");
  }

  private function convertDte($value) {
    if(is_array($value)) {
      if(isset($value['$dte']))  {
        return $this->createMongoDate($value['dte']);
      }
      else
        return array_map([$this, __FUNCTION__], $value); // recursively apply this function to whole pipeline
    }

    return $value;
  }

  private function convertOid($value) {
    if(is_array($value)) {
      if(isset($value['$oid'])) 
        return new \MongoId($value['$oid']);
      else
        return array_map([$this, __FUNCTION__], $value); // recursively apply this function to whole pipeline
    }

    return $value;
  }

  private function convertStringDate($value) {
    if (is_string($value)) {
      return $this->createMongoDate($value);
    } else if (is_array($value)) {
      foreach ($value as $key => $keyval) {
        switch ($key) {
          default:
            break;
          case '$lt':
          case '$lte':
          case '$gt':
          case '$gte':
          case '$eq':
          case '$ne':
            $value[$key] = $this->createMongoDate($keyval);
            break;
        }
      }
    }

    return $value;
  }

  private function checkForStringDates($value) {
    if(is_array($value)) {
      foreach ($value as $key => $keyval) {
        if ($key === 'statement.timestamp') {
          $value['timestamp'] = $this->convertStringDate($keyval);
          unset($value['statement.timestamp']);
        } else if ($key === 'statement.stored') {
          $value['stored'] = $this->convertStringDate($keyval);
          unset($value['statement.stored']);
        } else {
          $value[$key] = $this->checkForStringDates($keyval);
        }
      }
    }

    return $value;
  }



  private function getPipeline() {
    $pipeline = $this->getParam('pipeline');
    $pipeline = $this->convertDte($pipeline);
    $pipeline = $this->convertOid($pipeline);

    if (Config::get('xapi.aggregate_on_native_dates')) {
      // replace matches on string dates with native ones
      $pipeline = $this->checkForStringDates($pipeline);
    }

    return $pipeline;
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
