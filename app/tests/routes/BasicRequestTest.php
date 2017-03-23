<?php namespace Tests\Routes;
use \Tests\LrsTestCase as LrsTestCase;
use \Locker\Helpers\Helpers as Helpers;

class BasicRequestTest extends LrsTestCase {
  use RouteTestTrait;

  public function setup() {
    parent::setup();
  }

  
  public function testRejectNoCredentials() {
    $params = [
      'Content-Type' => 'application/json'
    ];
    $server = [];
    $details = [];
    $content = json_encode($details);
    $this->setExpectedException('Exception', 'Unauthorized request.');
    $response = $this->request('POST', '/data/xAPI/Basic/request', $params, $server, $content);
  }

  public function testRejetBadCredentials() {
    $params = [
      'Content-Type' => 'application/json'
    ];
    $server = [
      'PHP_AUTH_USER' => 'baduser',
      'PHP_AUTH_PW' => 'badpass',
    ];
    $details = [];
    $content = json_encode($details);
    $this->setExpectedException('Exception', 'Unauthorized request.');
    $response = $this->request('POST', '/data/xAPI/Basic/request', $params, $server, $content);
  }

  public function testDefaults() {
    $params = [
      'Content-Type' => 'application/json'
    ];
    $server = $this->getServer($this->ll_client);
    $details = [];
    $content = json_encode($details);
    $response = $this->request('POST', '/data/xAPI/Basic/request', $params, $server, $content);
    
    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertEquals(true, method_exists($response, 'getContent'));

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content));
    $this->assertEquals(true, isset($content->key));
    $this->assertEquals(true, isset($content->secret));

    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content));
    $this->assertEquals(true, isset($content->key));
    $this->assertEquals(true, isset($content->secret));

    $client = Helpers::getClient($content->key, $content->secret);
    $this->assertEquals(true, isset($client->authority));
    $this->assertEquals(true, isset($client->authority['mbox']));
    $this->assertEquals(true, isset($client->authority['name']));
    $this->assertEquals('mailto:hello@learninglocker.net', $client->authority['mbox']);
    $this->assertEquals('API Client', $client->authority['name']);
    $this->assertEquals(true, isset($client->scopes));
    $this->assertEquals(1, count($client->scopes));
    $this->assertEquals('all', $client->scopes[0]);
  }

  public function testName() {
    $server = array_merge($this->getServer($this->ll_client), [
      'CONTENT_TYPE' => 'application/json'
    ]);
    $content = json_encode([
      'name' => 'client name'
    ]);
    $response = $this->request('POST', '/data/xAPI/Basic/request', [], $server, $content);
    
    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertEquals(true, method_exists($response, 'getContent'));

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content));
    $this->assertEquals(true, isset($content->key));
    $this->assertEquals(true, isset($content->secret));

    $client = Helpers::getClient($content->key, $content->secret);
    $this->assertEquals(true, isset($client->authority));
    $this->assertEquals(true, isset($client->authority['name']));
    $this->assertEquals('client name', $client->authority['name']);
  }

  public function testMbox() {
    $server = array_merge($this->getServer($this->ll_client), [
      'CONTENT_TYPE' => 'application/json'
    ]);
    $content = json_encode([
      'mbox' => 'mailto:someemail@testcase.com'
    ]);
    $response = $this->request('POST', '/data/xAPI/Basic/request', [], $server, $content);
    
    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertEquals(true, method_exists($response, 'getContent'));

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content));
    $this->assertEquals(true, isset($content->key));
    $this->assertEquals(true, isset($content->secret));

    $client = Helpers::getClient($content->key, $content->secret);
    $this->assertEquals(true, isset($client->authority));
    $this->assertEquals(true, isset($client->authority['mbox']));
    $this->assertEquals('mailto:someemail@testcase.com', $client->authority['mbox']);
  }

  public function testScopes() {
    $server = array_merge($this->getServer($this->ll_client), [
      'CONTENT_TYPE' => 'application/json'
    ]);
    $content = json_encode([
      'scopes' => ['state', 'statements/write']
    ]);
    $response = $this->request('POST', '/data/xAPI/Basic/request', [], $server, $content);
    
    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertEquals(true, method_exists($response, 'getContent'));

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content));
    $this->assertEquals(true, isset($content->key));
    $this->assertEquals(true, isset($content->secret));

    $client = Helpers::getClient($content->key, $content->secret);

    $this->assertEquals(true, isset($client->scopes));
    $this->assertEquals(2, count($client->scopes));
    $this->assertEquals('state', $client->scopes[0]);
    $this->assertEquals('statements/write', $client->scopes[1]);
  }

  public function testBadScopes() {
    $server = array_merge($this->getServer($this->ll_client), [
      'CONTENT_TYPE' => 'application/json'
    ]);
    $content = json_encode([
      'scopes' => 'notascope'
    ]);
    $response = $this->request('POST', '/data/xAPI/Basic/request', [], $server, $content);
    
    // Checks that the response is correct.
    $this->assertEquals(400, $response->getStatusCode());
    $this->assertEquals(true, method_exists($response, 'getContent'));

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content));
    $this->assertEquals(true, $content->error);
    $this->assertEquals('Scopes must be an array or not defined', $content->message);
    $this->assertEquals(400, $content->code);
  }
  
  public function tearDown() {
    parent::tearDown();
  }
}