<?php namespace Locker\Repository\File;
use OpenCloud\Rackspace as Rackspace;
use League\Flysystem\Rackspace\RackspaceAdapter as RackspaceAdapter;
use Locker\Helpers\Helpers as Helpers;

class RackspaceFlyRepository extends FlyRepository {

  public function __construct() {
    $client = new Rackspace(Helpers::getEnvVar('FS_ENDPOINT'), [
      'username' => Helpers::getEnvVar('FS_USERNAME'),
      'apiKey' => Helpers::getEnvVar('FS_API_KEY'),
    ]);
    $store = $client->objectStoreService('cloudFiles', Helpers::getEnvVar('FS_REGION'));
    $container = $store->getContainer(Helpers::getEnvVar('FS_CONTAINER'));
    $adapter = new RackspaceAdapter($container);
    $this->constructFileSystem($adapter);
  }

}
