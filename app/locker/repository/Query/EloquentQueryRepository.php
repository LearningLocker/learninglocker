<?php namespace Locker\Repository\Query;

class EloquentQueryRepository implements QueryRepository {


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

}