<?php namespace Locker\Repository\Statement;

interface StatementRepository {

	public function all($id,$parameters);

	public function find($id);

	public function create($statement, $lrs, $attachment);

	public function statements($id);

  public function count($lrs);

}