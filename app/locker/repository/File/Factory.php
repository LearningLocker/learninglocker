<?php namespace Locker\Repository\File;
use Locker\Helpers\Helpers as Helpers;

class Factory {
  public static function create() {
    $repo = Helpers::getEnvVar('FS_REPO');

    return static::createRepo($repo);
  }

  public static function createRepo($repo) {
    $repos = [
      'Local' => 'LocalFlyRepository',
      'Rackspace' => 'RackspaceFlyRepository',
      'Copy' => 'CopyFlyRepository',
      'Dropbox' => 'DropboxFlyRepository',
      'Azure' => 'AzureFlyRepository',
      'S3V3' => 'S3V3FlyRepository',
    ];
    $repo = ucfirst(strtolower($repo));
    $conf = function ($var) {
      return Helpers::getEnvVar($var);
    };

    if (isset($repos[$repo])) {
      $selected_repo = 'Locker\Repository\File\\'.$repos[$repo];
      return new $selected_repo($conf);
    } else {
      throw new \Exception('Valid `FS_REPO` not specified in ".env.'.\App::environment().'.php". Valid values include: "'.implode('", "', array_keys($repos)).'". You provided "'.$repo.'".');
    }
  }
}