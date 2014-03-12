<?php namespace Locker\Repository\Site;

interface SiteRepository {

  public function all();

  public function find($id);

  public function create($input);

  public function update($id,$data);

  public function delete($id);

  public function verifyUser($user_id);

}