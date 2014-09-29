<?php namespace locker;

use Illuminate\Support\ServiceProvider;

class RequestServiceProvider extends ServiceProvider {
  public function register() {
    $app = $this->app;

    $app['locker_request'] = function(){
      return new Request;
    };
  }
}