<?php namespace Locker\Repository\File;
use Aws\S3\S3Client as S3Client;
use League\Flysystem\AwsS3v3\AwsS3Adapter as AwsS3Adapter;

class S3V3FlyRepository extends FlyRepository {

  public function __construct(Callable $conf) {
    $client = S3Client::factory([
      'credentials' => [
        'key' => $conf('FS_S3V3_KEY'),
        'secret' => $conf('FS_S3V3_SECRET'),
      ],
      'region' => $conf('FS_S3V3_REGION'),
      'version' => $conf('FS_S3V3_VERSION'),
    ]);

    $adapter = new AwsS3Adapter($client, $conf('FS_S3V3_BUCKET'), $conf('FS_S3V3_PREFIX'));
    $this->constructFileSystem($adapter);
  }

}
