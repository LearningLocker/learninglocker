<?php namespace Locker\Repository\Report;

interface ReportRepository {

  public function all($lrs);

  public function create( $input );

  public function delete($id);

  public function find($id);

  public function getActors($lrs, $query);

  public function setQuery($lrs, $query, $field, $wheres);

}