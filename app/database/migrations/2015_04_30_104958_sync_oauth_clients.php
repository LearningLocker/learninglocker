<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SyncOauthClients extends Migration {

	public function up() {
    $db = DB::getMongoDB()->oauth_clients;
    (new \Client)->get()->each(function ($client) use ($db) {
      $db->insert([
        'client_id' => $client->api['basic_key'],
        'client_secret' => $client->api['basic_secret'],
        'redirect_uri' => 'http://www.example.com/'
      ]);
    });
    (new \Lrs)->get()->each(function ($lrs) use ($db) {
      if (isset($lrs->api) && isset($lrs->api['basic_key']) && isset($lrs->api['basic_secret'])) {
        $db->insert([
          'client_id' => $lrs->api['basic_key'],
          'client_secret' => $lrs->api['basic_secret'],
          'redirect_uri' => 'http://www.example.com/'
        ]);
      }
    });
  }

  public function down() {
    DB::getMongoDB()->oauth_clients->remove([]);
  }

}
