<?php namespace Locker\Repository\File;
use League\Flysystem\Adapter\Local as LocalAdapter;

class LocalFlyRepository extends FlyRepository {

  public function __construct(array $conf) {
    $adapter = new LocalAdapter($conf['ENDPOINT']);
    $this->constructFileSystem($adapter);
  }

}
