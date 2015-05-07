<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Carbon\Carbon;

class AddXapiScopes extends Migration {

	public function up() {
    // Creates scopes as defined by the spec.
    // https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#details-29
    $scopes = [
      'statements/write', 
      'statements/read/mine', 
      'statements/read', 
      'state', 
      'define', 
      'profile'
    ];

    DB::getMongoDB()->oauth_scopes->insert([
      'default_scope' => null,
      'supported_scopes' => $scopes
    ]);
	}

	public function down() {
		DB::getMongoDB()->oauth_scopes->remove([]);
	}

}
