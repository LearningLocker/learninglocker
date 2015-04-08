<?php namespace Tests\API;
use \Route as Route;

class StatementsTest extends TestCase {
  static protected $endpoint = '/api/v1/statements';
  protected $pipeline = null;

  public function setup() {
    parent::setup();
  }

  protected function getPipeline() {
    return $this->pipeline ?: file_get_contents(__DIR__ . '/../Fixtures/pipeline.json');
  }

  protected function requestStatementsAPI($method = 'GET', $url = '', $params = []) {
    $headers = $this->getHeaders($this->lrs->api);
    Route::enableFilters();
    return $this->call($method, $url.'?'.http_build_query($params), [
      'X-Experience-API-Version' => '1.0.1'
    ], [], $headers, '');
  }

  public function testAggregate() {
    $response = $this->requestStatementsAPI('GET', static::$endpoint.'/aggregate', [
      'pipeline' => $this->getPipeline()
    ]);

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode(), 'Incorrect status code.');
    $this->assertEquals(true, method_exists($response, 'getContent'), 'Incorrect response.');

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content), 'Incorrect content.');
    $this->assertEquals(true, isset($content->result), 'No result.');
    $this->assertEquals(true, is_array($content->result), 'Incorrect result.');
    $this->assertEquals(static::$statements, count($content->result), 'Incorrect number of results.');
    $this->assertEquals(true, is_object($content->result[0]), 'Incorrect projection.');
    $this->assertEquals(true, isset($content->result[0]->statement), 'No statement.');
    $this->assertEquals(true, is_object($content->result[0]->statement), 'Incorrect statement.');
    $this->assertEquals(true, isset($content->result[0]->statement->actor), 'No actor.');
    $this->assertEquals(true, isset($content->ok), 'No ok.');
    $this->assertEquals(true, is_numeric($content->ok), 'Incorrect ok.');
  }

  public function testAggregateTime() {
    $response = $this->requestStatementsAPI('GET', static::$endpoint.'/aggregate/time', [
      'match' => '{"active": true}'
    ]);

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode(), 'Incorrect status code.');
  }

  public function testAggregateObject() {
    $response = $this->requestStatementsAPI('GET', static::$endpoint.'/aggregate/object', [
      'match' => '{"active": true}'
    ]);

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode(), 'Incorrect status code.');
  }

  public function testWhere() {
    $response = $this->requestStatementsAPI('GET', static::$endpoint.'/where', [
      'filter' => '[[{"active", true}]]',
      'limit' => 1,
      'page' => 1
    ]);

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode(), 'Incorrect status code.');
  }

  public function tearDown() {
    parent::tearDown();
  }
}
