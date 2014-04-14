<?php

use Illuminate\Database\Migrations\Migration;

class AddStatements extends Migration {


  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up(){
    Schema::table('statements', function($table){
      $table->index('lrs._id');
      $table->index(array('lrs._id', 'statement.object.id'));
      $table->index(array('lrs._id', 'statement.verb.id'));
      $table->index(array('lrs._id', 'statement.actor.mbox'));
    });
  }

  public function down(){
    
  }

}