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
    ->where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $lrs)
    ->where( $field, $value )
    ->select( $select )
    ->distinct()
    ->remember(5)
    ->get();
  }

  public function timedGrouping($filters, $interval){

    /*
    $results = $this->db->statements->aggregate(
      array('$match' => $filters),
      array(
        '$group' => array(
          '_id'   => 'stored',
          'count' => array('$sum' => 1),
          'date'  => array('$addToSet' => '$stored'),
          'actor' => array('$addToSet' => '$actor')
        )
      ),
      array('$sort'    => array('_id' => 1)),
      array('$project' => array('count' => 1, 'actor' => 1))
    );
    */
    $results = array('result'=>[]);

    return $results['result'];
  }

}