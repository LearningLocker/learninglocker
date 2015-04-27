<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Carbon\Carbon;

class AddXapiScopes extends Migration {

	public function up() {
		$timestamp = Carbon::now();

    // Creates scopes as defined by the spec.
    // https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#details-29
    $scopes = [
      $this->createScope('statements/write', 'statements-write', $timestamp),
      $this->createScope('statements/read/mine', 'statements-read-mine', $timestamp),
      $this->createScope('statements/read', 'statements-read', $timestamp),
      $this->createScope('state', 'state', $timestamp),
      $this->createScope('define', 'define', $timestamp),
      $this->createScope('profile', 'profile', $timestamp),
      $this->createScope('all/read', 'all-read', $timestamp),
      $this->createScope('all', 'all', $timestamp)
    ];

    DB::connection('mysql')->table('oauth_scopes')->insert($scopes);
	}

  private function createScope($id, $description, $timestamp) {
    return [
      'id' => $id,
      'description' => trans("xapi.scope-descriptions.$description"),
      'created_at' => $timestamp,
      'updated_at' => $timestamp,
    ];
  }

	public function down() {
		DB::connection('mysql')->table('oauth_scopes')->delete();
	}

}
