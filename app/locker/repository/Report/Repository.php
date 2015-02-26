<?php namespace Locker\Repository\Report;

interface Repository extends \Locker\Repository\Base\Repository {
  public function setQuery($lrs, $query, $field, $wheres);
  public function statements($id, array $opts);
}