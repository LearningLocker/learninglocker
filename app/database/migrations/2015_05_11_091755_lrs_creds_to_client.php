<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class LrsCredsToClient extends Migration {

  public function up() {
    (new \Lrs)->get()->each(function ($lrs) {
      if (isset($lrs->api) && isset($lrs->api['basic_key']) && isset($lrs->api['basic_secret'])) {
        $client = new \Client();
        $client->api = $lrs->api;
        $client->lrs_id = $lrs->_id;
        $client->authority = [
          'name' => $lrs->title,
          'mbox' => 'mailto:hello@learninglocker.net'
        ];
        $client->save();
      }
    });
  }

  public function down() {
    (new \Lrs)->get()->each(function ($lrs) {
      if (!isset($lrs->api) || !isset($lrs->api['basic_key']) || !isset($lrs->api['basic_secret'])) {
        $client = (new \Client())->where('lrs_id', $lrs->_id)->first();
        
        if ($client !== null) {
          $lrs->api = $client->api;
          $lrs->save();
        }
      }
    });
  }

}
