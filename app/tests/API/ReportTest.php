<?php namespace Tests\API;

class ReportTest extends ResourceTestCase {
  static protected $endpoint = '/api/v1/reports';
  static protected $model_class = '\Report';
  protected $data = [
    'name' => 'Test report',
    'description' => 'Test report description',
    'query' => [
      'statement&64;actor&64;mbox' => ['mailto:test@example.com']
    ]
  ];
  protected $update = [
    'name' => 'Test updated report'
  ];

  protected function getModelFromContent(array $content) {
    unset($content['_id']);
    unset($content['created_at']);
    unset($content['updated_at']);
    return $content;
  }

  protected function testRun() {
    $response = $this->requestAPI('GET', "{$this->report->_id}/run");
    $content = $this->getContentFromResponse($response);

    // Checks that the response is correct.
    $this->assertEquals(self::$statements, count($content));
    $this->assertEquals(200, $response->getStatusCode());
  }

  protected function testGraph() {
    $response = $this->requestAPI('GET', "{$this->report->_id}/graph");
    $content = $this->getContentFromResponse($response);

    // Checks that the correct number of statements are returned.
    $this->assertEquals(self::$statements, $content[0]['count']);
    $this->assertEquals(200, $response->getStatusCode());
  }
}
