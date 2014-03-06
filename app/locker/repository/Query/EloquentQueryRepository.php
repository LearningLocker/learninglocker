<?php namespace Locker\Repository\Query;

class EloquentQueryRepository implements QueryRepository {

  protected $db;

  public function __construct(){
    $this->db = \DB::getMongoDB();
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
    ->where(SPECIFIC_LRS, $lrs)
    ->where( $field, $value )
    ->select( $select )
    ->distinct()
    ->remember(5)
    ->get();
  }

  /**
   * Return data based on dates
   *
   * @todo if timestamp becomes required in the spec, we could use that to 
   * better reflect when the action actually happened, not when
   * saved in the LRS, instead of $stored
   *
   * @param int    $lrs
   * @param array  $filters e.g. date, from a date, between dates, including in / or
   * @param string $interval e.g. dayOfYear, week, month, year etc
   *
   **/
  public function timedGrouping( $lrs, $filters, $interval, $type='time' ){

    //set filters
    $lrs_filter = array(SPECIFIC_LRS => $lrs);

    //if further filters passed, add them
    $match = array_merge( $lrs_filter, $filters );

    if( $type == 'time' ){
      $set_id = array( $interval => '$created_at' );
    }else{
      switch($type){
        case 'user': 
          $set_id  = array('actor' => '$actor');  
          $project = array('$addToSet' => '$actor');  
          break;
        case 'verb': 
          $set_id  = array('verb' => '$verb');   
          $project = array('$addToSet' => '$verb');    
          break;
        case 'activity': 
          $set_id  = array('activity' => '$object'); 
          $project = array('$addToSet' => '$object');
          break;
      }
    }

    //construct mongo aggregation query
    if( $type == 'time' ){
      $results = $this->db->statements->aggregate(
        array('$match' => $match),
        array(
            '$group' => array(
              '_id'    => $set_id,
              'count'  => array('$sum' => 1),
              'date'   => array('$addToSet' => '$stored')
            )
        ),
        array('$sort'  => array('count' => -1)),
        array('$project' => array('_id' => 0, 'count' => 1, 'date' => 1))
      );
    }else{
      $results = $this->db->statements->aggregate(
        array('$match' => $match),
        array(
          '$group' => array(
            '_id'   => $set_id, //, 'dayOfYear' => '$created_at'
            'count' => array('$sum' => 1),
            'dates' => array('$addToSet' => '$stored'),
            'data'  => $project
          ),
        ),
        array('$unwind' => '$data'),
        array('$sort' => array('count' => -1)),
        array('$project' => array('_id' => 0, 'data' => 1, 'count' => 1, 'dates' => 1))
      );
    }

    return $results;

  }

  /**
   * Return a grouping of object ordered by count. Useful to get the top 6 courses.
   * Or bottom three badges used.
   *
   * @param $lrs
   * @param $filters
   * @param $grou_key 
   * @param $include
   * @param $limit 
   * @param $sort
   *
   * @return $results
   *
   **/
  public function objectGrouping( $lrs, $filters, $group_key, $include, $limit = 10, $sort = '-1' ){

    //set filters
    $lrs_filter = array(SPECIFIC_LRS => $lrs);

    //if further filters passed, add them
    $match = array_merge( $lrs_filter, $filters );

    //set group key 
    $group_key = '$context.contextActivities.grouping.id';

    //set items to add to result set
    $add_to_set = '$context.contextActivities.grouping.definition.name';

    //set sort -1 for desc and 1 for asc

    //construct mongo aggregation query
    $results = $this->db->statements->aggregate(
      array('$match' => $match),
      array(
        '$group'  => array(
          '_id'   => $group_key,
          'name'  => array('$addToSet' => $add_to_set), 
          'count' => array('$sum' => 1)
        )
      ),
      array('$sort'  => array('count' => $sort)),
      array('$limit' => $limit)
    );

    return $results;

  }

}