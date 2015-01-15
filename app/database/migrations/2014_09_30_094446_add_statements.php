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
      $table->index('lrs._id', [
        'name' => 'lrs._id_index'
      ]);
      $table->index(['lrs._id', 'statement.object.id'], [
        'name' => 'lrs._id_statement.object.id_index'
      ]);
      $table->index(['lrs._id', 'statement.verb.id'], [
        'name' => 'lrs._id_statement.verb.id_index'
      ]);
      $table->index(['lrs._id', 'statement.actor.mbox'], [
        'name' => 'lrs._id_statement.actor.mbox_index'
      ]);
      $table->index(['lrs._id', 'timestamp'], [
        'name' => 'lrs._id_timestamp_index'
      ]);
      $table->index(['statement.stored'], [
        'name' => 'statement.stored_index'
      ]);
      $table->index(['statement.stored', 'lrs._id'], [
        'name' => 'statement.stored_lrs._id_index'
      ]);
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::table('statements', function (Blueprint $table) {
			$table->dropIndex('lrs._id_index');
      $table->dropIndex('lrs._id_statement.object.id_index');
      $table->dropIndex('lrs._id_statement.verb.id_index');
      $table->dropIndex('lrs._id_statement.actor.mbox_index');
      $table->dropIndex('lrs._id_timestamp_index');
      $table->dropIndex('statement.stored_index');
      $table->dropIndex('statement.stored_lrs._id_index');
		});
	}
}
