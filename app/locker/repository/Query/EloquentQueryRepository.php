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

    $statements->remember(5);
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
    $lrs_filter = array('lrs._id' => $lrs);

    //if further filters passed, add them
    $match = array_merge( $lrs_filter, $filters );

    if( $type == 'time' ){
      if( !$interval ) $interval = '$dayOfYear';
      $set_id = array( $interval => '$timestamp' );
    }else{
      switch($type){
        case 'user': 
          $set_id  = array('actor' => '$statement.actor');  
          $project = array('$addToSet' => '$statement.actor');  
          break;
        case 'verb': 
          $set_id  = array('verb' => '$statement.verb');   
          $project = array('$addToSet' => '$statement.verb');    
          break;
        case 'activity': 
          $set_id  = array('activity' => '$statement.object'); 
          $project = array('$addToSet' => '$statement.object');
          break;
      }
    }

    //construct mongo aggregation query
    if( $type == 'time' ){
      $results = $this->db->statements->aggregate(
        array('$match' => $match),
        array(
            '$group' => array(
              '_id'   => $set_id,
              'count' => array('$sum' => 1),
              'date'  => array('$addToSet' => '$statement.timestamp')
            )
        ),
        array('$sort'  => array('date' => 1)),
        array('$project' => array('_id'   => 0, 'count' => 1, 'date'  => 1 ))
      );
    }else{
      $results = $this->db->statements->aggregate(
        array('$match' => $match),
        array(
          '$group' => array(
            '_id'   => $set_id, //, 'dayOfYear' => '$created_at'
            'count' => array('$sum' => 1),
            'dates' => array('$addToSet' => '$statement.timestamp'),
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