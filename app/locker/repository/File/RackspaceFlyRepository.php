<?php namespace Locker\Repository\File;
use OpenCloud\Rackspace as Rackspace;
use League\Flysystem\Rackspace\RackspaceAdapter as RackspaceAdapter;

class RackspaceFlyRepository extends FlyRepository {

  public function __construct(Callable $conf) {
    $client = new Rackspace($conf('FS_RACK_ENDPOINT'), [
      'username' => $conf('FS_RACK_USERNAME'),
      'apiKey' => $conf('FS_RACK_API_KEY'),
    ]);
    $store = $client->objectStoreService('cloudFiles', $conf('FS_RACK_REGION'), $conf('FS_RACK_URL_TYPE'));
    $container = $store->getContainer($conf('FS_RACK_CONTAINER'));
    $adapter = new RackspaceAdapter($container);
    $this->constructFileSystem($adapter);
  }

}
