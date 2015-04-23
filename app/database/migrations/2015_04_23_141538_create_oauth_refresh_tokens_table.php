<?php

use Illuminate\Database\Schema\Blueprint;
use LucaDegasperi\OAuth2Server\Support\Migration;

class CreateOauthRefreshTokensTable extends Migration
{

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection('mysql')->create('oauth_refresh_tokens', function (Blueprint $table) {
            $table->string('id', 40)->unique();
            $table->string('access_token_id', 40);
            $table->integer('expire_time');

            $table->timestamps();

            $table->foreign('access_token_id')
                  ->references('id')->on('oauth_access_tokens')
                  ->onDelete('cascade');
            $table->primary('access_token_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection('mysql')->table('oauth_refresh_tokens', function (Blueprint $table) {
            $table->dropForeign('oauth_refresh_tokens_access_token_id_foreign');
        });
        Schema::connection('mysql')->drop('oauth_refresh_tokens');
    }
}
