<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SyncOauthClients extends Migration {
  protected $oauth_clients = [];

	public function up() {
    (new \Client)->get()->each(function ($client) {
      $this->oauth_clients[] = [
        'id' => $client->api['basic_key'],
        'secret' => $client->api['basic_secret'],
        'name' => $client->_id
      ];
    });

    DB::connection('mysql')->table('oauth_clients')->insert($this->oauth_clients);
  }

  public function down() {
    DB::connection('mysql')->table('oauth_clients')->delete();
  }

}
