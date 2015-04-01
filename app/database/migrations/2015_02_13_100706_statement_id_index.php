<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class StatementIdIndex extends Migration {

	public function up() {
		Schema::table('statements', function (Blueprint $table) {
      $table->index(['statement.id', 'lrs._id']);
    });
	}

	public function down() {
		Schema::table('statements', function (Blueprint $table) {
      $table->dropIndex(['statement.id', 'lrs._id']);
    });
	}
}
