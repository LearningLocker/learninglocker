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
    $server = $this->getHeaders($this->lrs->api);
    Route::enableFilters();
    return $this->call($method, $url, $params, [], $server, '');
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
    $this->assertEquals(true, is_object($content), 'Incorrect content type.');
    $this->assertEquals(true, isset($content->result), 'No result.');
    $this->assertEquals(true, is_array($content->result), 'Incorrect result type.');
    $this->assertEquals(static::$statements, count($content->result), 'Incorrect number of results.');
    $this->assertEquals(true, is_object($content->result[0]), 'Incorrect projection type.');
    $this->assertEquals(true, isset($content->result[0]->statement), 'No statement.');
    $this->assertEquals(true, is_object($content->result[0]->statement), 'Incorrect statement type.');
    $this->assertEquals(true, isset($content->result[0]->statement->actor), 'No actor.');
    $this->assertEquals(true, isset($content->ok), 'No ok.');
    $this->assertEquals(true, is_numeric($content->ok), 'Incorrect ok type.');
    $this->assertEquals(1, $content->ok, 'Incorrect ok.');
  }

  public function testAggregateTime() {
    $response = $this->requestStatementsAPI('GET', static::$endpoint.'/aggregate/time', [
      'match' => '{"active": true}'
    ]);

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode(), 'Incorrect status code.');
    $this->assertEquals(true, method_exists($response, 'getContent'), 'Incorrect response.');

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content), 'Incorrect content type.');
    $this->assertEquals(true, isset($content->result), 'No result.');
    $this->assertEquals(true, is_array($content->result), 'Incorrect result type.');
    $this->assertEquals(1, count($content->result), 'Incorrect number of results.');
    $this->assertEquals(true, is_object($content->result[0]), 'Incorrect projection type.');
    $this->assertEquals(true, isset($content->result[0]->count), 'No count.');
    $this->assertEquals(true, is_numeric($content->result[0]->count), 'Incorrect count type.');
    $this->assertEquals(static::$statements, is_numeric($content->result[0]->count), 'Incorrect count.');
    $this->assertEquals(true, isset($content->result[0]->date), 'No date.');
    $this->assertEquals(true, is_array($content->result[0]->date), 'Incorrect date type.');
    $this->assertEquals(true, isset($content->ok), 'No ok.');
    $this->assertEquals(true, is_numeric($content->ok), 'Incorrect ok type.');
    $this->assertEquals(1, $content->ok, 'Incorrect ok.');
  }

  public function testAggregateObject() {
    $response = $this->requestStatementsAPI('GET', static::$endpoint.'/aggregate/object', [
      'match' => '{"active": true}'
    ]);

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode(), 'Incorrect status code.');
    $this->assertEquals(true, method_exists($response, 'getContent'), 'Incorrect response.');

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content), 'Incorrect content type.');
    $this->assertEquals(true, isset($content->result), 'No result.');
    $this->assertEquals(true, is_array($content->result), 'Incorrect result type.');
    $this->assertEquals(1, count($content->result), 'Incorrect number of results.');
    $this->assertEquals(true, is_object($content->result[0]), 'Incorrect projection type.');
    $this->assertEquals(true, isset($content->result[0]->count), 'No count.');
    $this->assertEquals(true, is_numeric($content->result[0]->count), 'Incorrect count type.');
    $this->assertEquals(static::$statements, is_numeric($content->result[0]->count), 'Incorrect count.');
    $this->assertEquals(true, isset($content->result[0]->data), 'No data.');
    $this->assertEquals(true, is_array($content->result[0]->data), 'Incorrect data type.');
    $this->assertEquals(static::$statements, count($content->result[0]->data), 'Incorrect data.');
    $this->assertEquals(true, isset($content->result[0]->data[0]), 'Incorrect data item.');
    $this->assertEquals(true, is_object($content->result[0]->data[0]), 'Incorrect data item type.');
    $this->assertEquals(true, isset($content->result[0]->data[0]->actor), 'No actor.');
    $this->assertEquals(true, is_object($content->result[0]->data[0]->actor), 'Incorrect actor type.');
    $this->assertEquals(true, isset($content->ok), 'No ok.');
    $this->assertEquals(true, is_numeric($content->ok), 'Incorrect ok type.');
    $this->assertEquals(1, $content->ok, 'Incorrect ok.');
  }

  public function testWhere() {
    $response = $this->requestStatementsAPI('GET', static::$endpoint.'/where', [
      'filter' => '[[{"active", true}]]',
      'limit' => 1,
      'page' => 1
    ]);

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode(), 'Incorrect status code.');
    $this->assertEquals(true, method_exists($response, 'getContent'), 'Incorrect response.');

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_object($content), 'Incorrect content type.');

    // Checks set props.
    $this->assertEquals(true, isset($content->total), 'No total.');
    $this->assertEquals(true, isset($content->per_page), 'No per_page.');
    $this->assertEquals(true, isset($content->current_page), 'No current_page.');
    $this->assertEquals(true, isset($content->last_page), 'No last_page.');
    $this->assertEquals(true, isset($content->from), 'No from.');
    $this->assertEquals(true, isset($content->to), 'No to.');
    $this->assertEquals(true, isset($content->data), 'No data.');

    // Checks prop types.
    $this->assertEquals(true, is_numeric($content->total), 'Incorrect total type.');
    $this->assertEquals(true, is_numeric($content->per_page), 'Incorrect per_page type.');
    $this->assertEquals(true, is_numeric($content->current_page), 'Incorrect current_page type.');
    $this->assertEquals(true, is_numeric($content->last_page), 'Incorrect last_page type.');
    $this->assertEquals(true, is_numeric($content->from), 'Incorrect from type.');
    $this->assertEquals(true, is_numeric($content->to), 'Incorrect to type.');
    $this->assertEquals(true, is_array($content->data), 'Incorrect data type.');

    // Checks prop content.
    $this->assertEquals(static::$statements, $content->total, 'Incorrect total value.');
    $this->assertEquals(1, $content->per_page, 'Incorrect per_page value.');
    $this->assertEquals(1, $content->current_page, 'Incorrect current_page value.');
    $this->assertEquals(static::$statements, $content->last_page, 'Incorrect last_page value.');
    $this->assertEquals(1, $content->from, 'Incorrect from value.');
    $this->assertEquals(1, $content->to, 'Incorrect to value.');
    $this->assertEquals(1, count($content->data), 'Incorrect data count.');
    $this->assertEquals(true, isset($content->data[0]), 'No data item.');
    $this->assertEquals(true, is_object($content->data[0]), 'Incorrect data item type.');
    $this->assertEquals(true, isset($content->data[0]->statement), 'No statement.');
    $this->assertEquals(true, is_object($content->data[0]->statement), 'Incorrect statement type.');
    $this->assertEquals(true, isset($content->data[0]->statement->actor), 'No actor.');
    $this->assertEquals(true, is_object($content->data[0]->statement->actor), 'Incorrect actor type.');
  }

  public function tearDown() {
    parent::tearDown();
  }
}
