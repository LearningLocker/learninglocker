<?php namespace Locker\Repository\File;
use League\Flysystem\Adapter\Local as LocalAdapter;

class LocalFlyRepository extends FlyRepository {

  public function __construct(Callable $conf) {
    $adapter = new LocalAdapter($conf('FS_LOCAL_ENDPOINT'));
    $this->constructFileSystem($adapter);
  }

}
