<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeForeignKeyIndexes extends Migration {

	public function up() {
		Schema::table('statements', function (Blueprint $table) {
      $table->index('lrs_id');
      $table->index(['lrs_id', 'statement.object.id']);
      $table->index(['lrs_id', 'statement.verb.id']);
      $table->index(['lrs_id', 'statement.actor.mbox']);
      $table->index(['lrs_id', 'timestamp']);
      $table->index(['statement.stored', 'lrs_id']);
      $table->index(['statement.id', 'lrs_id']);
      $table->dropIndex('lrs._id');
      $table->dropIndex(['lrs._id', 'statement.object.id']);
      $table->dropIndex(['lrs._id', 'statement.verb.id']);
      $table->dropIndex(['lrs._id', 'statement.actor.mbox']);
      $table->dropIndex(['lrs._id', 'timestamp']);
      $table->dropIndex(['statement.stored', 'lrs._id']);
      $table->dropIndex(['statement.id', 'lrs._id']);
    });
	}

	public function down() {
		Schema::table('statements', function (Blueprint $table) {
      $table->index('lrs._id');
      $table->index(['lrs._id', 'statement.object.id']);
      $table->index(['lrs._id', 'statement.verb.id']);
      $table->index(['lrs._id', 'statement.actor.mbox']);
      $table->index(['lrs._id', 'timestamp']);
      $table->index(['statement.stored', 'lrs._id']);
      $table->index(['statement.id', 'lrs._id']);
      $table->dropIndex('lrs_id');
      $table->dropIndex(['lrs_id', 'statement.object.id']);
      $table->dropIndex(['lrs_id', 'statement.verb.id']);
      $table->dropIndex(['lrs_id', 'statement.actor.mbox']);
      $table->dropIndex(['lrs_id', 'timestamp']);
      $table->dropIndex(['statement.stored', 'lrs_id']);
      $table->dropIndex(['statement.id', 'lrs_id']);
    });
	}

}
