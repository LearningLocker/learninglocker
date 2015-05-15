<?php namespace Tests\Routes;
use \Tests\StatementsTestCase as StatementsTestCase;

class StatementsTest extends StatementsTestCase {
  use RouteTestTrait;

  public function setup() {
    parent::setup();
  }

  protected function getPipeline() {
    return '[{"$match":{"active":true}},{"$project":{"_id":0,"statement":1}}]';
  }

  protected function requestStatements($uri = '', $params = []) {
    $method = 'GET';
    $content = null;
    $uri = '/api/v1/statements/'.$uri;
    $server = $this->getServer($this->ll_client);
    return $this->request($method, $uri, $params, $server, $content);
  }

  public function testAggregate() {
    $response = $this->requestStatements('aggregate', [
      'pipeline' => $this->getPipeline()
    ]);

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertEquals(true, method_exists($response, 'getContent'));

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content));
    $this->assertEquals(true, isset($content->result));
    $this->assertEquals(true, is_array($content->result));
    $this->assertEquals(count($this->statements), count($content->result));
    $this->assertEquals(true, is_object($content->result[0]));
    $this->assertEquals(true, isset($content->result[0]->statement));
    $this->assertEquals(true, is_object($content->result[0]->statement));
    $this->assertEquals(true, isset($content->result[0]->statement->actor));
    $this->assertEquals(true, isset($content->ok));
    $this->assertEquals(true, is_numeric($content->ok));
    $this->assertEquals(1, $content->ok);
  }

  public function testAggregateTime() {
    $response = $this->requestStatements('aggregate/time', [
      'match' => '{"active": true}'
    ]);

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertEquals(true, method_exists($response, 'getContent'));

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content));
    $this->assertEquals(true, isset($content->result));
    $this->assertEquals(true, is_array($content->result));
    $this->assertEquals(1, count($content->result));
    $this->assertEquals(true, is_object($content->result[0]));
    $this->assertEquals(true, isset($content->result[0]->count));
    $this->assertEquals(true, is_numeric($content->result[0]->count));
    $this->assertEquals(count($this->statements), is_numeric($content->result[0]->count));
    $this->assertEquals(true, isset($content->result[0]->date));
    $this->assertEquals(true, is_array($content->result[0]->date));
    $this->assertEquals(true, isset($content->ok));
    $this->assertEquals(true, is_numeric($content->ok));
    $this->assertEquals(1, $content->ok);
  }

  public function testAggregateObject() {
    $response = $this->requestStatements('aggregate/object', [
      'match' => '{"active": true}'
    ]);

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertEquals(true, method_exists($response, 'getContent'));

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content));
    $this->assertEquals(true, isset($content->result));
    $this->assertEquals(true, is_array($content->result));
    $this->assertEquals(1, count($content->result));
    $this->assertEquals(true, is_object($content->result[0]));
    $this->assertEquals(true, isset($content->result[0]->count));
    $this->assertEquals(true, is_numeric($content->result[0]->count));
    $this->assertEquals(count($this->statements), is_numeric($content->result[0]->count));
    $this->assertEquals(true, isset($content->result[0]->data));
    $this->assertEquals(true, is_array($content->result[0]->data));
    $this->assertEquals(count($this->statements), count($content->result[0]->data));
    $this->assertEquals(true, isset($content->result[0]->data[0]));
    $this->assertEquals(true, is_object($content->result[0]->data[0]));
    $this->assertEquals(true, isset($content->result[0]->data[0]->actor));
    $this->assertEquals(true, is_object($content->result[0]->data[0]->actor));
    $this->assertEquals(true, isset($content->ok));
    $this->assertEquals(true, is_numeric($content->ok));
    $this->assertEquals(1, $content->ok);
  }

  public function testWhere() {
    $response = $this->requestStatements('where', [
      'filter' => '[[{"active", true}]]',
      'limit' => 1,
      'page' => 1
    ]);

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertEquals(true, method_exists($response, 'getContent'));

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content));

    // Checks set props.
    $this->assertEquals(true, isset($content->total));
    $this->assertEquals(true, isset($content->per_page));
    $this->assertEquals(true, isset($content->current_page));
    $this->assertEquals(true, isset($content->last_page));
    $this->assertEquals(true, isset($content->from));
    $this->assertEquals(true, isset($content->to));
    $this->assertEquals(true, isset($content->data));

    // Checks prop types.
    $this->assertEquals(true, is_numeric($content->total));
    $this->assertEquals(true, is_numeric($content->per_page));
    $this->assertEquals(true, is_numeric($content->current_page));
    $this->assertEquals(true, is_numeric($content->last_page));
    $this->assertEquals(true, is_numeric($content->from));
    $this->assertEquals(true, is_numeric($content->to));
    $this->assertEquals(true, is_array($content->data));

    // Checks prop content.
    $this->assertEquals(count($this->statements), $content->total);
    $this->assertEquals(1, $content->per_page);
    $this->assertEquals(1, $content->current_page);
    $this->assertEquals(count($this->statements), $content->last_page);
    $this->assertEquals(1, $content->from);
    $this->assertEquals(1, $content->to);
    $this->assertEquals(1, count($content->data));
    $this->assertEquals(true, isset($content->data[0]));
    $this->assertEquals(true, is_object($content->data[0]));
    $this->assertEquals(true, isset($content->data[0]->statement));
    $this->assertEquals(true, is_object($content->data[0]->statement));
    $this->assertEquals(true, isset($content->data[0]->statement->actor));
    $this->assertEquals(true, is_object($content->data[0]->statement->actor));
  }

  public function tearDown() {
    parent::tearDown();
  }
}
