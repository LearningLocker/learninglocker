<?php namespace Locker\Repository\User;

interface UserRepository {

  public function all();

  public function find($id);

  public function create();

  public function update($id, $data);

  public function delete($id);

  public function validate($data);

  public function updateRole($user, $role);

  public function updatePassword($id, $password);

}