<?php namespace Locker\Repository\File;
use League\Flysystem\Adapter\Local as LocalAdapter;
use Locker\Helpers\Helpers as Helpers;

class LocalFlyRepository extends FlyRepository {

  public function __construct() {
    $adapter = new LocalAdapter(Helpers::getEnvVar('FS_ENDPOINT'));
    $this->constructFileSystem($adapter);
  }

}
