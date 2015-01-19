<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class AddStatements extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		Schema::table('statements', function (Blueprint $table) {
      $table->index('lrs._id');
      $table->index(['lrs._id', 'statement.object.id']);
      $table->index(['lrs._id', 'statement.verb.id']);
      $table->index(['lrs._id', 'statement.actor.mbox']);
      $table->index(['lrs._id', 'timestamp']);
      $table->index(['statement.stored']);
      $table->index(['statement.stored', 'lrs._id']);
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::table('statements', function (Blueprint $table) {
      $table->dropIndex('lrs._id');
			$table->dropIndex(['lrs._id', 'statement.object.id']);
      $table->dropIndex(['lrs._id', 'statement.verb.id']);
      $table->dropIndex(['lrs._id', 'statement.actor.mbox']);
      $table->dropIndex(['lrs._id', 'timestamp']);
      $table->dropIndex(['statement.stored']);
      $table->dropIndex(['statement.stored', 'lrs._id']);
		});
	}
}
