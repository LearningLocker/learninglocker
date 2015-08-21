<?php namespace Locker\Repository\File;
use WindowsAzure\Common\ServicesBuilder;
use League\Flysystem\Azure\AzureAdapter;

class AzureFlyRepository extends FlyRepository {

  public function __construct(Callable $conf) {
    $endpoint = sprintf(
        $conf('FS_AZURE_PROTOCOL'),
        $conf('FS_AZURE_USERNAME'),
        conf('FS_AZURE_API_KEY')
    );
    $blobRestProxy = ServicesBuilder::getInstance()->createBlobService($endpoint);
    $adapter = new AzureAdapter($blobRestProxy, conf('FS_AZURE_CONTAINER'));
    $this->constructFileSystem($adapter);
  }

}
