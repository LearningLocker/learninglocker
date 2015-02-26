<?php namespace Tests\API;
use \Illuminate\Http\ResponseTrait as Response;

abstract class ResourceTestCase extends TestCase {
  static protected $model_class = '...';
  protected $data = [];
  protected $model = null;

  public function __construct() {
    parent::__construct();
    $this->data = $this->constructData($this->data);
    $this->model = $this->createModel($this->data);
  }

  protected function constructData($data) {
    $data['lrs'] = $this->lrs->_id;
    return $data;
  }

  protected function createModel($data) {
    $model = new static::$model_class($data);
    $model->save();
    return $model;
  }

  public function testIndex() {
    $response = $this->requestAPI();
    $content = $this->getResponseContent($response);
    $model = $this->getModelFromContent($content[0]);

    // Checks that the response is correct.
    $this->assertEquals(1, count($content));
    $this->assertEquals($this->data, $model);
    $this->assertEquals(200, $response->getStatusCode());
  }

  public function testStore() {
    $response = $this->requestAPI('POST', '', json_encode($this->data));
    $model = $this->getModelFromResponse($response);

    // Checks that the response is correct.
    $this->assertEquals($this->data, $model);
    $this->assertEquals(200, $response->getStatusCode());
  }

  public function testUpdate() {
    $data = array_merge($this->data, $this->update);
    $response = $this->requestAPI('PUT', $this->model->_id, json_encode($data));
    $model = $this->getModelFromResponse($response);

    // Checks that the response is correct.
    $this->assertEquals($data, $model);
    $this->assertEquals(200, $response->getStatusCode());
  }

  public function testShow() {
    $response = $this->requestAPI('GET', $this->model->_id);
    $model = $this->getModelFromResponse($response);

    // Checks that the response is correct.
    $this->assertEquals($this->data, $model);
    $this->assertEquals(200, $response->getStatusCode());
  }

  public function testDestroy() {
    $response = $this->requestAPI('DELETE', $this->model->_id);
    $model = $this->getModelFromResponse($response);

    // Checks that the response is correct.
    $this->assertEquals(null, $model);
    $this->assertEquals(204, $response->getStatusCode());
  }

  private function getModelFromResponse(Response $response) {
    return $this->getModelFromContent($this->getContentFromResponse());
  }

  protected function getModelFromContent(array $content) {
    return $content;
  }

  protected function getContentFromResponse(Response $response) {
    return json_decode($response->getContent(), true);
  }
}
