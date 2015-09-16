<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use \Locker\XApi\Helpers as XAPIHelpers;

class UpdateLrsUserIds extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		(new \Lrs)->get()->each(function ($lrs) {
      if( isset($lrs->users) ) $lrs->users = XAPIHelpers::convertIds($lrs->users);
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


db.users.update({}, {$set: { users: [{
                        "_id" : "55f92d9be51088181f000029",
                        "email" : "andrewhickey@live.co.uk",
                        "name" : "Andrew Hickey",
                        "role" : "admin"
                },
                {
                        "_id" : "55f92dd3e51088a81f000029",
                        "email" : "andrew.hickey@ht2.co.uk",
                        "role" : "observer"
                }]}})