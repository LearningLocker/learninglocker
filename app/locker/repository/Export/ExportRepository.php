<?php namespace Locker\Repository\Export;

interface ExportRepository {

  public function all($lrs);

  public function create( $input );

  public function delete($id);

  public function find($id);

}