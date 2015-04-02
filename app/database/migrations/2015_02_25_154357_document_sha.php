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
      echo(count($documents) . ' converted.').PHP_EOL;
    });

    echo('All finished, hopefully!').PHP_EOL;
	}

	public function down() {
		DocumentAPI::chunk(1000, function($documents){
      foreach ($documents as $document){
        $document->sha = '"'.trim($document->sha, '"').'"';
        $document->save();
      }
      echo(count($documents) . ' converted.').PHP_EOL;
    });

    echo('All finished, hopefully!').PHP_EOL;
	}
}

