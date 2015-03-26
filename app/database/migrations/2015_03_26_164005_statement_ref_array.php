<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class StatementRefArray extends Migration {
	public function up() {
    Statement::chunk(1000, function($statements) {
      foreach ($statements as $statement) {
        if (is_object($statement->refs) || (is_array($statement->refs) && isset($statement->refs['id']))) {
          $statement->refs = [$statement->refs];
          $statement->save();
        }
      }
      echo(count($statements) . ' converted.');
    });

    echo('All finished, hopefully!');
  }

  public function down() {
    echo('Nothing to do.');
  }
}
