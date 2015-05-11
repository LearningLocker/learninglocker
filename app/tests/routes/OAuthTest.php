<?php namespace Tests\Routes;

class OAuthTest extends \Tests\LrsTestCase {
  use RouteTestTrait;

  public function setup() {
    parent::setup();
    \DB::getMongoDB()->oauth_clients->insert([
      'client_id' => $this->ll_client->api['basic_key'],
      'client_secret' => $this->ll_client->api['basic_secret'],
      'redirect_uri' => 'http://www.example.com/'
    ]);
  }

  protected function requestToken($client_id, $client_secret, $grant_type = 'client_credentials') {
    $method = 'POST';
    $uri = '/oauth/access_token';
    $params = [
      'client_id' => $client_id,
      'client_secret' => $client_secret,
      'grant_type' => $grant_type
    ];
    $server = [];
    $content = null;
    return $this->request($method, $uri, $params, $server, $content);
  }

  protected function requestApi($token) {
    $method = 'GET';
    $uri = '/data/xAPI/statements';
    $params = [];
    $server = [
      'HTTP_Authorization' => 'Bearer '.$token,
      'HTTP_X-Experience-API-Version' => '1.0.1'
    ];
    $content = null;
    return $this->request($method, $uri, $params, $server, $content);
  }

  public function testAccessTokenViaClient() {
    $response = $this->requestToken($this->ll_client->api['basic_key'], $this->ll_client->api['basic_secret']);
    $data = json_decode($response->getContent());
    
    $this->assertEquals(true, is_object($data));

    // Checks properties of result object.
    $this->assertEquals(true, isset($data->access_token));
    $this->assertEquals(true, isset($data->expires_in));
    $this->assertEquals(true, isset($data->token_type));

    // Checks property types of result object.
    $this->assertEquals(true, is_string($data->access_token));
    $this->assertEquals(true, is_int($data->expires_in));
    $this->assertEquals(true, is_string($data->token_type));

    // Checks property values of result object.
    $this->assertEquals(3600, $data->expires_in);
    $this->assertEquals('Bearer', $data->token_type);
  }

  public function testAccessViaToken() {
    $token_response = $this->requestToken($this->ll_client->api['basic_key'], $this->ll_client->api['basic_secret']);
    $token = json_decode($token_response->getContent())->access_token;
    $response = $this->requestApi($token);
    $data = $response->getContent();

    // Checks result object.
    $this->assertEquals('{"more":"","statements":[]}', $data);
  }

  public function tearDown() {
    parent::tearDown();
  }
}
