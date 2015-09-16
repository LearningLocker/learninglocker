<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use \Locker\Helpers\Helpers as Helpers;

class UpdateLrsUserIds extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		(new \Lrs)->get()->each(function ($lrs) {
      if( isset($lrs->users) ) $lrs->users = Helpers::convertIds($lrs->users);
      $lrs->save();
    });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		//
	}

}