<?php namespace Locker\Repository\Query;

interface QueryRepository {

  public function selectDistinctField( $lrs, $table, $field, $value, $select );

}