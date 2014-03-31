<?php namespace Locker\Repository\Report;

interface ReportRepository {

  public function all();

  public function create( $input );

  public function delete($id);

  public function find($id);

}