<?php namespace Tests\Routes;

class ExportsTest extends ResourcesTestCase {
  static protected $endpoint = '/api/v1/exports';
  static protected $model_class = '\Export';
  protected $data = [
    'name' => 'Test export',
    'description' => 'Test export description',
    'fields' => [
      ['from' => 'statement.actor.mbox', 'to' => 'mbox']
    ]
  ];
  protected $update = [
    'name' => 'Test updated export'
  ];

  protected function constructData($data) {
    $this->report = $this->createReport();
    $data['report'] = $this->report->_id;
    return parent::constructData($data);
  }

  protected function createReport() {
    $model = new \Report([
      'name' => 'Test report',
      'description' => 'Test report description',
      'query' => [
        'statement.actor.mbox' => ['mailto:test@example.com']
      ],
      'lrs' => $this->lrs->_id
    ]);
    $model->save();
    return $model;
  }

  public function testJson() {
    $response = $this->requestResource('GET', static::$endpoint.'/'."{$this->model->_id}/show");
    $content = $response->getContent();

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode(), 'Incorrect status code.');
  }

  public function testCsv() {
    $response = $this->requestResource('GET', static::$endpoint.'/'."{$this->model->_id}/show/csv");
    $content = $response->getContent();

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode(), 'Incorrect status code.');
  }

  public function tearDown() {
    $this->report->delete();
    parent::tearDown();
  }
}
