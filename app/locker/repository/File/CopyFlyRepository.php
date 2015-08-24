<?php namespace Locker\Repository\File;
use Barracuda\Copy\API as CopyAPI;
use League\Flysystem\Copy\CopyAdapter as CopyAdapter;

class CopyFlyRepository extends FlyRepository {

  public function __construct(Callable $conf) {
    $client = new API(
      $conf('FS_COPY_CONSUMER_KEY'),
      $conf('FS_COPY_CONSUMER_SECRET'),
      $conf('FS_COPY_ACCESS_TOKEN'),
      $conf('FS_COPY_TOKEN_SECRET')
    );
    $adapter = new CopyAdapter($client, $conf('FS_COPY_PREFIX'));
    $this->constructFileSystem($adapter);
  }

}
