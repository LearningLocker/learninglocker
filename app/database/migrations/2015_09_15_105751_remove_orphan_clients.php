<?php
use Illuminate\Database\Migrations\Migration;

class RemoveOrphanClients extends Migration
{

  /**
   * Removes documents from the client collection that have
   * an lrs_id that does not exist in the lrs collection.
   *
   * @return void
   */
  public function up()
  {
    $db = \DB::getMongoDB();
    $clients = new MongoCollection($db, 'client');
    $lrss = new MongoCollection($db, 'lrs');
    
    $clientCursor = $clients->find([], ['lrs_id' => true]);
    
    foreach ($clientCursor as $client) {
      $count = $lrss->count(['_id' => $client['lrs_id']]);
      if ($count == 0) {
        $clients->remove(['_id' => $client['_id']]);
      }
    }
  }

  public function down()
  {
    //
  }
}
