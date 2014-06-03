<?php namespace Locker\Repository\Query;

interface QueryRepository {

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
  public function selectDistinctField( $lrs, $table, $field, $value, $select );

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
  public function timedGrouping( $lrs, $filters, $interval, $type );

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
  public function objectGrouping( $lrs, $section, $filters, $returnFields );

  /**
   * Query to grab statement based on a filter
   *
   * @param $lrs       id      The Lrs to search in (required)
   * @param $filter    array   The filter array
   * @param $raw       boolean  Pagination or raw statements?
   * 
   * @return array results
   *
   **/
  public function selectStatements( $lrs, $filter, $raw );

}