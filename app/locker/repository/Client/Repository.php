<?php namespace Locker\Repository\Client;

interface Repository extends \Locker\Repository\Base\Repository {
  public function showFromUserPass($username, $password, array $opts);
}