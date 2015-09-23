<?php
use Illuminate\Database\Migrations\Migration;

class ClientForeignIds extends Migration
{

  /**
   * Convert foreign id values from string to MongoId.
   *
   * @return void
   */
  public function up()
  {
    $db = \DB::getMongoDB();
    
    Client::get()->each(function (Client $client) use($db)
    {
      // The Client model has a mutator that converts lrs_id values to MongoId objects.
      $client->lrs_id = $client->lrs_id;
      $client->save();
    });
    
    echo 'Foreign id values in client collection converted from string to MongoId.' . PHP_EOL;
  }

  /**
   * Convert foreign id values from MongoId to string.
   *
   * @return void
   */
  public function down()
  {
    // The Client model has a mutator that converts lrs_id from string to MongoId,
    // so the Mongo classes are used to directly modify the client collection.
    $db = \DB::getMongoDB();
    $clients = new MongoCollection($db, 'client');
    
    $lrsIds = $clients->aggregateCursor([
      [
        '$group' => [
          '_id' => '$lrs_id'
        ]
      ]
    ]);
    
    foreach ($lrsIds as $lrsId) {
      $clients->update([
        'lrs_id' => $lrsId['_id']
      ], [
        '$set' => [
          'lrs_id' => (string) $lrsId['_id']
        ]
      ], [
        'multiple' => true
      ]);
    }
    
    echo 'Foreign id values in client collection converted from MongoId to string.' . PHP_EOL;
  }
}
