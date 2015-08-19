<?php namespace Locker\Repository\File;
use OpenCloud\OpenStack as OpenStack;
use League\Flysystem\Rackspace\RackspaceAdapter as RackspaceAdapter;

class RackspaceFlyRepository extends FlyRepository {

  public function __construct(array $conf) {
    $client = new OpenStack($conf['ENDPOINT'], [
      'username' => $conf['USERNAME'],
      'password' => $conf['PASSWORD'],
    ]);
    $store = $client->objectStoreService('cloudFiles', $conf['LOCATION']);
    $container = $store->getContainer('flysystem');
    $adapter = new RackspaceAdapter($container);
    $this->constructFileSystem($adapter);
  }

}
