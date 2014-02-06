<?php namespace Locker\Data;

use Illuminate\Support\ServiceProvider;

class DataServiceProvider extends ServiceProvider {

	public function register(){

		$this->app->bind(
		  'Locker\Data\Analytics\AnalyticsInterface',
		  'Locker\Data\Analytics\Analytics'
		);
		
	}


}