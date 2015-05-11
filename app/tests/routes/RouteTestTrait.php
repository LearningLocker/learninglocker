<?php namespace Tests\Routes;

trait RouteTestTrait {

  protected function getServer(\Client $client, $version = '1.0.1') {
    return [
      'PHP_AUTH_USER' => $client->api['basic_key'],
      'PHP_AUTH_PW' => $client->api['basic_secret'],
      'HTTP_X-Experience-API-Version' => $version
    ];
  }

  protected function request($method = 'GET', $uri = '', $params = [], $server = [], $content = null) {
    $files = [];
    $changeHistory = true;
    \Route::enableFilters();
    
    // http://laravel.com/api/4.2/Illuminate/Foundation/Testing/TestCase.html#method_call
    return $this->call($method, $uri, $params, $files, $server, $content, $changeHistory);
  }
}
