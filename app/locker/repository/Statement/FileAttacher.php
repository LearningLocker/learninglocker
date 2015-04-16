<?php namespace Locker\Repository\Statement;

class FileAttacher {

  public function store(array $attachments, StoreOptions $opts) {
    $dir = Helpers::getEnvVar('LOCAL_FILESTORE').'/'.$opts->getOpt('lrs_id').'/attachments/';
    if (!is_dir($dir)) mkdir($dir, null, true);

    foreach ($attachments as $attachment) {
      file_put_contents($dir.$attachment->file, $attachment->content);
    }
  }
}
