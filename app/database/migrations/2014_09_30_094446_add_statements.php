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
      $table->index(array('lrs._id', 'statement.object.id'));
      $table->index(array('lrs._id', 'statement.verb.id'));
      $table->index(array('lrs._id', 'statement.actor.mbox'));
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::table('statements', function (Blueprint $table) {
			
		});
	}
}
