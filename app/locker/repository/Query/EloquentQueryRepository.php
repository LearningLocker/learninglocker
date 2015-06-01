<?php namespace Locker\Repository\Query;
use \Locker\Helpers\Helpers as Helpers;

class EloquentQueryRepository implements QueryRepository {

  const LRS_ID_KEY = 'lrs._id';
  protected $db;

  public function __construct(){
    $this->db = \DB::getMongoDB();
  }

  /**
   * Gets all statements in the LRS (with the $lrsId) that match the $filters.
   * @param string $lrsId
   * @param [mixed] $filters
   * @return Illuminate\Database\Eloquent\Builder
   */
  public function where($lrsId, array $filters) {
    $statements = \Statement::where(self::LRS_ID_KEY, $lrsId);

    foreach ($filters as $filter) {
      switch ($filter[1]) {
        case 'in': $statements->whereIn($filter[0], $filter[2]); break;
        case 'between': $statements->whereBetween($filter[0], [$filter[2], $filter[3]]); break;
        case 'or':
                if (!empty($filter[2]) && is_array($filter[2])) {
                    $statements->where(function($query) use ($filter) {
                        foreach ($filter[2] as $value) {
                            foreach ($value[1] as $subVal) {
                                if (is_object($subVal)) {
                                    $subVal_array = get_object_vars($subVal);
                                    $query->orWhere(function($query) use ($subVal_array, $value) {
                                        foreach ($subVal_array as $key => $val) {
                                            $query->where($value[0] . '.' . $key, '=', $val);
                                        }
                                    });
                                } else {
                                    $query->orWhere($value[0], '=', $subVal);
                                }
                            }
                        }
                    });
                }
                break;
        default: $statements->where($filter[0], $filter[1], $filter[2]);
      }
    }

    return $statements;
  }

  /**
   * Aggregates the statements in the LRS (with the $lrsId) with the $pipeline.
   * @param string $lrsId
   * @param [mixed] $pipeline
   * @return [Aggregate] http://php.net/manual/en/mongocollection.aggregate.php#refsect1-mongocollection.aggregate-examples
   */
  public function aggregate($lrsId, array $pipeline) {
    if (strpos(json_encode($pipeline), '$out') !== false) {
      return;
    }

    $pipeline[0] = array_merge_recursive([
      '$match' => [self::LRS_ID_KEY => $lrsId]
    ], $pipeline[0]);

    return Helpers::replaceHtmlEntity($this->db->statements->aggregate($pipeline), true);
  }

  /**
   * Aggregates statements in the LRS (with the $lrsId) that $match into a timed group.
   * @param string $lrsId
   * @param [mixed] $match
   * @return [Aggregate] http://php.net/manual/en/mongocollection.aggregate.php#refsect1-mongocollection.aggregate-examples
   */
  public function aggregateTime($lrsId, array $match) {
    return $this->aggregate($lrsId, [[
      '$match' => $match
    ], [
      '$group' => [
        '_id'   => [
          'year' => ['$year' => '$timestamp'],
          'month' => ['$month' => '$timestamp'],
          'day' => ['$dayOfMonth' => '$timestamp']
        ],
        'count' => ['$sum' => 1],
        'date'  => ['$addToSet' => '$statement.timestamp']
      ]
    ],
    ['$sort'  => ['date' => 1]],
    ['$project' => [
      '_id' => 0,
      'count' => 1,
      'date'  => 1
    ]]]);
  }

  /**
   * Aggregates statements in the LRS (with the $lrsId) that $match into a object group.
   * @param string $lrsId
   * @param [mixed] $match
   * @return [Aggregate] http://php.net/manual/en/mongocollection.aggregate.php#refsect1-mongocollection.aggregate-examples
   */
  public function aggregateObject($lrsId, array $match) {
    return $this->aggregate($lrsId, [[
      '$match' => $match
    ], [
      '$group' => [
        '_id'   => '$statement.object.id',
        'data'  => ['$addToSet' => '$statement'],
        'count' => ['$sum' => 1],
      ]
    ], [
      '$project' => [
        '_id' => 1,
        'data' => 1,
        'count' => 1
      ]
    ]]);
  }

  /**
   * Query to grab the required data based on type
   *
   * @param $lrs       id       The Lrs to search in (required)
   * @param $table     string   The database table to use
   * @param $value     string   The value of the field to search for
   * @param $field     string   The field we are searching against
   * @param $select    string   The field we want returned
   *
   * @return array results
   *
   **/
  public function selectDistinctField( $lrs='', $table='', $field='', $value='', $select='' ){
    return \DB::table($table)
    ->where('lrs._id', $lrs)
    ->where( $field, $value )
    ->select( $select )
    ->distinct()
    ->remember(5)
    ->get();
  }

  /**
   * Gets statement documents based on a filter.
   * 
   * @param $lrs       id      The Lrs to search in (required)
   * @param $filter    array   The filter array
   * @param $raw       boolean  Pagination or raw statements?
   * @param $sections  array   Sections of the statement to return, default = all
   * 
   * @return Statement query
   */
  public function selectStatementDocs( $lrs='', $filter, $raw=false, $sections=[] ){
    $statements = \Statement::where('lrs._id', $lrs);

    if( !empty($filter) ){
      
      foreach($filter as $key => $value ){
        if( is_array($value) ){
          //does the array contain between values? e.g. <> 3, 6
          if( $value[0] === '<>' ){
            $statements->whereBetween($key, array((int)$value[1], (int)$value[2]));
          }else{
            $statements->whereIn($key, $value); //where key is in array
          }
        }else{
          $statements->where($key, $value);
        }
      }

    }

    return $statements;
  }

  /**
   * Query to grab statement based on a filter
   *
   * @param $lrs       id      The Lrs to search in (required)
   * @param $filter    array   The filter array
   * @param $raw       boolean  Pagination or raw statements?
   * @param $sections  array   Sections of the statement to return, default = all
   * 
   * @return array results
   *
   **/
  public function selectStatements( $lrs='', $filter, $raw=false, $sections=[] ){
    $statements = $this->selectStatementDocs($lrs, $filter, $raw, $sections);

    //which part of the statement should we return?
    if( empty($sections) ){
      $statements->select('statement');
    }else{
      //loop through and construct select query
      $select = [];
      foreach( $sections as $s ){
        //create select string
        $select[] = 'statement.' . $s;
      }
      $statements->select($select);
    }

    if( $raw ){
      return $statements->get()->toArray();
    }
    return $statements->paginate(20);
  }

  /**
   * Return data based on dates
   *
   * @param int    $lrs
   * @param array  $filters e.g. date, from a date, between dates, including in / or
   * @param string $interval e.g. dayOfYear, week, month, year etc
   *
   **/
  public function timedGrouping( $lrs, $filters, $interval, $type='time' ){

    //set filters
    $lrs_filter = ['lrs._id' => $lrs];

    //if further filters passed, add them
    $match = array_merge( $lrs_filter, $filters );

    if( $type == 'time' ){
      if( !$interval ) $interval = '$dayOfYear';
      $set_id = [ $interval => '$timestamp' ];
    }else{
      switch($type){
        case 'user': 
          $set_id  = ['actor' => '$statement.actor'];  
          $project = ['$addToSet' => '$statement.actor'];  
          break;
        case 'verb': 
          $set_id  = ['verb' => '$statement.verb'];   
          $project = ['$addToSet' => '$statement.verb'];    
          break;
        case 'activity': 
          $set_id  = ['activity' => '$statement.object']; 
          $project = ['$addToSet' => '$statement.object'];
          break;
      }
    }

    //construct mongo aggregation query
    if( $type == 'time' ){
      $results = $this->db->statements->aggregate([
        '$match' => $match
      ], [
        '$group' => [
          '_id'   => $set_id,
          'count' => ['$sum' => 1],
          'date'  => ['$addToSet' => '$statement.timestamp']
        ]
      ],
      ['$sort'  => ['date' => 1]],
      ['$project' => [
        '_id' => 0,
        'count' => 1,
        'date'  => 1
      ]]);
    }else{
      $results = $this->db->statements->aggregate([
        '$match' => $match
      ], [
        '$group' => [
          '_id'   => $set_id, //, 'dayOfYear' => '$created_at'
          'count' => ['$sum' => 1],
          'dates' => ['$addToSet' => '$statement.timestamp'],
          'data'  => $project
        ],
      ],
      ['$unwind' => '$data'],
      ['$sort' => ['count' => -1]],
      ['$project' => [
        '_id' => 0,
        'data' => 1,
        'count' => 1,
        'dates' => 1
      ]]);
    }

    return $results;

  }

  /**
   * Return grouped object based on criteria passed.
   *
   * @param $lrs
   * @param $section 
   * @param $filters 
   * @param $returnFields
   *
   * @return $results
   *
   **/
  public function objectGrouping( $lrs, $section='', $filters='', $returnFields ){

    //set filters
    $lrs_filter = array('lrs._id' => $lrs);

    //if further filters passed, add them
    $match = array_merge( $lrs_filter, $filters );

    //set returnFields if set
    if( $returnFields == '' ){
      $project = array('$project' => array('_id' => 0, 'data' => 1, 'count' => 1));
    }else{
      $display = array('_id' => 0, 'count' => 1);
      foreach($returnFields as $field){
        $display['data.'.$field] = 1;
      }
      $project = array('$project' => $display);
    }

    //construct mongo aggregation query
    $results = $this->db->statements->aggregate(
      array('$match' => $match),
      array(
        '$group'  => array(
          '_id'   => $section,
          'data'  => array('$addToSet' => $section),
          'count' => array('$sum' => 1),
        )
      ),
      $project
    );

    return $results;

  }

}
