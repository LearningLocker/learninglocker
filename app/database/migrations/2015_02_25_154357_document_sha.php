<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class DocumentSha extends Migration {

	public function up() {
		DocumentAPI::chunk(1000, function($documents){
      foreach ($documents as $document){
        $document->sha = trim($document->sha, '"');
        $document->save();
      }
      echo(count($documents) . ' converted.');
    });

    echo('All finished, hopefully!');
	}

	public function down() {
		DocumentAPI::chunk(1000, function($documents){
      foreach ($documents as $document){
        $document->sha = '"'.trim($document->sha, '"').'"';
        $document->save();
      }
      echo(count($documents) . ' converted.');
    });

    echo('All finished, hopefully!');
	}
}

