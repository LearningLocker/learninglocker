<?php namespace Locker\Repository\File;
use Locker\Helpers\Helpers as Helpers;

class Factory {
  public static function create() {
    $FS_REPO = Helpers::getEnvVar('FS_REPO');
    $FS_CONF = Helpers::getEnvVar('FS_CONF');

    switch ($FS_REPO) {
      case 'Local': return new LocalFlyRepository($FS_CONF);
      case 'Rackspace': return new RackspaceFlyRepositry($FS_CONF);
    }
  }
}