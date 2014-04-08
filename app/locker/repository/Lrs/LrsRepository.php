<?php namespace Locker\Repository\Lrs;

interface LrsRepository {

	public function all();

	public function find($id);

	public function create($input);

	public function update($id, $input);

	public function delete($id);

	public function removeUser($id, $user);

  public function getLrsOwned($user);

  public function getLrsMember($user);

}