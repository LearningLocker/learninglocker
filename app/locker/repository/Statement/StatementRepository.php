<?php namespace Locker\Repository\Statement;

interface StatementRepository {

	public function all();

	public function find($id);

	public function create($statement, $lrs);

	public function filter($id, $vars, $restrict);

}