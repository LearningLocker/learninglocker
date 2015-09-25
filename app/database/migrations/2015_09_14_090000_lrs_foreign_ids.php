<?php
use Illuminate\Database\Migrations\Migration;
use \Locker\Helpers\Helpers as Helpers;

class LrsForeignIds extends Migration
{

  public function up()
  {
    $db = \DB::getMongoDB();
    
    Lrs::get()->each(function (Lrs $lrs) use($db)
    {
      if( isset($lrs->users) ) $lrs->users = Helpers::convertIds($lrs->users);
      
      $lrs->owner_id = new \MongoId($lrs->owner_id);
      $lrs->save();
      
      echo 'IDs for lrs collection "' . $lrs->title . '" converted to MongoIds.' . PHP_EOL;
    });
  }

  public function down()
  {
    $db = \DB::getMongoDB();
    
    Lrs::get()->each(function (Lrs $lrs) use($db)
    {
      $users = $lrs->getAttribute('users');
      foreach ($users as &$user) {
        $user['_id'] = (string)$user['_id'];
      }
      $lrs->setAttribute('users', $users);
      
      $lrs->owner_id = (string)$lrs->owner_id;
      $lrs->save();
      
      echo 'IDs for lrs collection "' . $lrs->title . '" converted to strings.' . PHP_EOL;
    });
  }
}
