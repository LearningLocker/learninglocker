<?php namespace Locker\Repository\Client;

interface ClientRepository {

	public function all();

	public function find($id);

	public function create($input);

	public function update($id, $input);

	public function delete($id);

}