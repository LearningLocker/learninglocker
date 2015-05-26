<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddScopesToClients extends Migration {

  public function up() {
    (new \Client)->get()->each(function ($client) {
      $client->scopes = isset($client->scopes) ? $client->scopes : ['all'];
      $client->save();
    });
  }

  public function down() {}

}