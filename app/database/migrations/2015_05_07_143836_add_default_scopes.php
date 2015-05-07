<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDefaultScopes extends Migration {

  public function up() {
    $scopes = \DB::getMongoDB()->oauth_scopes->find()->getNext()['supported_scopes'];
    (new \Client)->get()->each(function ($client) use ($scopes) {
      $client->scopes = isset($client->scopes) ? $client->scopes : $scopes;
      $client->save();
    });
  }

  public function down() {
  }

}
