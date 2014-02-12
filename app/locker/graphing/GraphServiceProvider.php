<?php namespace Locker\Graphing;

use Illuminate\Support\ServiceProvider;

class GraphServiceProvider extends ServiceProvider {

  public function register(){

    $this->app->bind(
      'Locker\Graphing\GraphingInterface',
      'Locker\Graphing\Graphing'
    );
    
  }


}