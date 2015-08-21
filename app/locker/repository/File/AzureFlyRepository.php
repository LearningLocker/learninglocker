<?php namespace Locker\Repository\File;
use OpenCloud\Rackspace as Rackspace;
use League\Flysystem\Rackspace\RackspaceAdapter as RackspaceAdapter;

class RackspaceFlyRepository extends FlyRepository {

  public function __construct(Callable $conf) {
    $endpoint = sprintf(
        $conf('FS_AZURE_PROTOCOL'),
        $conf('FS_AZURE_USERNAME'),
        conf('FS_AZURE_API_KEY')
    );

    $blobRestProxy = ServicesBuilder::getInstance()->createBlobService($endpoint);

    $filesystem = new Filesystem(new AzureAdapter($blobRestProxy, conf('FS_AZURE_CONTAINER')));
  }

}
