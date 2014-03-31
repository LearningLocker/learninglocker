<?php namespace Locker\Repository\Query;

interface QueryRepository {

  public function selectDistinctField( $lrs, $table, $field, $value, $select );

  public function timedGrouping( $lrs, $filters, $interval, $type );

  public function objectGrouping( $lrs, $section, $filters, $returnFields );

  public function selectStatements( $lrs, $filter );

}