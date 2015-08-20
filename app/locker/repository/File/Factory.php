<?php namespace Locker\Repository\File;
use Locker\Helpers\Helpers as Helpers;

class Factory {
  public static function create() {
    $FS_REPO = Helpers::getEnvVar('FS_REPO');

    switch ($FS_REPO) {
      case 'Rackspace': return new RackspaceFlyRepository();
      default: return new LocalFlyRepository();
    }
  }
}