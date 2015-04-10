<?php namespace Tests\API;

class ReportsTest extends ResourcesTestCase {
  static protected $endpoint = '/api/v1/reports';
  static protected $model_class = '\Report';
  protected $data = [
    'name' => 'Test report',
    'description' => 'Test report description',
    'query' => [
      'statement.actor.mbox' => ['mailto:test@example.com']
    ]
  ];
  protected $update = [
    'name' => 'Test updated report'
  ];

  public function testRun() {
    $response = $this->requestAPI('GET', static::$endpoint.'/'."{$this->model->_id}/run");
    $content = $this->getContentFromResponse($response);

    // Checks that the response is correct.
    $this->assertEquals(self::$statements, count($content), 'Incorrect amount of statements.');
    $this->assertEquals(200, $response->getStatusCode(), 'Incorrect status code.');
  }

  public function testGraph() {
    $response = $this->requestAPI('GET', static::$endpoint.'/'."{$this->model->_id}/graph");
    $content = $this->getContentFromResponse($response);

    // Checks that the response is correct.
    $this->assertEquals(true, isset($content[0]['count']), 'Incorrectly formed content.');
    $this->assertEquals(self::$statements, $content[0]['count'], 'Incorrect amount of statements.');
    $this->assertEquals(200, $response->getStatusCode(), 'Incorrect status code.');
  }
}
