<?php namespace Tests\Routes;

class OAuthTest extends \Tests\LrsTestCase {
  use RouteTestTrait;

  public function setup() {
    parent::setup();
    \DB::getMongoDB()->oauth_clients->insert([
      'client_id' => $this->lrs->api['basic_key'],
      'client_secret' => $this->lrs->api['basic_secret'],
      'redirect_uri' => 'http://www.example.com/'
    ]);
  }

  protected function requestToken($client_id, $client_secret, $grant_type = 'client_credentials') {
    $method = 'POST';
    $uri = 'oauth/access_token';
    $params = [
      'client_id' => $client_id,
      'client_secret' => $client_secret,
      'grant_type' => $grant_type
    ];
    $server = [];
    $content = null;
    return $this->request($method, $uri, $params, $server, $content);
  }

  public function testAccessTokenViaClient() {
    $response = $this->requestToken($this->lrs->api['basic_key'], $this->lrs->api['basic_secret']);
    $data = json_decode($response->getContent());
    dd($data);
  }

  public function tearDown() {
    parent::tearDown();
  }
}
