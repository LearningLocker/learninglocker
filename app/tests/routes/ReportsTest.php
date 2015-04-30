<?php namespace Tests\Routes;

class ReportsTest extends ResourcesTestCase {
  static protected $endpoint = '/api/v1/reports';
  static protected $model_class = '\Report';
  protected $data = [
    'name' => 'Test report',
    'description' => 'Test report description',
    'query' => [
      'statement.actor.mbox' => ['mailto:test@example.com']
    ],
    'since' => null,
    'until' => null
  ];
  protected $update = [
    'name' => 'Test updated report'
  ];

  public function testRun() {
    $response = $this->requestResource('GET', static::$endpoint.'/'."{$this->model->_id}/run");
    $content = $this->getContentFromResponse($response);

    // Checks that the response is correct.
    $this->assertEquals(count($this->statements), count($content));
    $this->assertEquals(200, $response->getStatusCode());
  }

  public function testGraph() {
    $response = $this->requestResource('GET', static::$endpoint.'/'."{$this->model->_id}/graph");
    $content = $this->getContentFromResponse($response);

    // Checks that the response is correct.
    $this->assertEquals(true, isset($content[0]['count']));
    $this->assertEquals(count($this->statements), $content[0]['count']);
    $this->assertEquals(200, $response->getStatusCode());
  }
}
