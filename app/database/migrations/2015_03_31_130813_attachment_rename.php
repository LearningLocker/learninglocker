<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use \Locker\Helpers\Helpers as Helpers;

class AttachmentRename extends Migration {

  public function up() {
    $uploads = Helpers::getEnvVar('LOCAL_FILESTORE');
    $LRSs = $this->getDirectores($uploads);
    
    // Gets the attachments.
    $attachments = [];
    foreach ($LRSs as $lrs) {
      $attachments = array_merge($attachments, array_map(function ($dir) use ($uploads, $lrs) {
        return $uploads.'/'.$lrs.'/attachments/'.$dir;
      }, $this->getDirectores(
        $uploads.'/'.$lrs.'/attachments'
      )));
    }

    // Migrates the attachments.
    foreach ($attachments as $attachment) {
      $file = $attachment.'/'.scandir($attachment)[2];
      $ext = pathinfo($file, PATHINFO_EXTENSION);
      file_put_contents($attachment.'.'.$ext, file_get_contents($file));
    }

    echo 'Migrated '.count($attachments)." attachments.".PHP_EOL;
  }

  private function getDirectores($path) {
    //return blank if path does not exist
    if (!file_exists($path)) return [];
    
    //scan through path and return all directories 
    return array_values(array_filter(scandir($path), function ($name) use ($path) {
      return $name[0] !== '.' && is_dir($path.'/'.$name);
    }));
  }

  public function down() {
    
  }
}
