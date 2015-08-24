<?php namespace Locker\Repository\File;
use Aws\S3\S3Client as S3Client;
use League\Flysystem\AwsS3v2\AwsS3Adapter as AwsS3Adapter;

class S3V2FlyRepository extends FlyRepository {

  public function __construct(Callable $conf) {
    $client = S3Client::factory([
      'base_url' => $conf('FS_S3V2_ENDPOINT'),
      'key' => $conf('FS_S3V2_KEY'),
      'secret' => $conf('FS_S3V2_SECRET'),
      'region' => $conf('FS_S3V2_REGION'),
    ]);

    $adapter = new AwsS3Adapter($client, $conf('FS_S3V2_BUCKET'), $conf('FS_S3V2_PREFIX'));
    $this->constructFileSystem($adapter);
  }

}
