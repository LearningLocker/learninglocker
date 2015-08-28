<?php namespace Locker\Repository\File;
use Dropbox\Client as DropboxClient;
use League\Flysystem\Dropbox\DropboxAdapter as DropboxAdapter;

class DropboxFlyRepository extends FlyRepository {

  public function __construct(Callable $conf) {
    $client = new DropboxClient($conf('FS_DROPBOX_ACCESS_TOKEN'), $conf('FS_DROPBOX_APP_SECRET'));
    $adapter = new DropboxAdapter($client, [$conf('FS_DROPBOX_PREFIX')]);
    $this->constructFileSystem($adapter);
  }

}
