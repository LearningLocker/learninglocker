<?php namespace Tests\Routes;

class QueryTest extends \Tests\StatementsTestCase {
  use RouteTestTrait;

  public function setup() {
    parent::setup();
  }

  protected function requestAnalytics($params = []) {
    $content = null;
    return $this->request('GET', 'api/v1/query/analytics', $params, $this->getServer($this->ll_client), $content);
  }

  public function testAnalyticsDefault() {
    $response = $this->requestAnalytics();
    $data = $response->getData();
    $this->assertEquals($data->version, 'v1');
    $this->assertEquals($data->route, 'api/v1/query/analytics');
  }

  public function testAnalyticsTime() {
    $response = $this->requestAnalytics(['type' => 'time']);
    $data = $response->getData()->data;
    $this->assertEquals(count($this->statements), $data[0]->count);
  }

  public function testUserQuery() {
    $response = $this->requestAnalytics(['type' => 'user']);
    $data = $response->getData();

    $this->assertEquals(true, is_object($data));
    $this->assertEquals(true, isset($data->data));
    $this->assertEquals(true, is_array($data->data));
    $this->assertEquals(count($this->statements), count($data->data));

    // Asserts correct properties on data[0].
    $this->assertEquals(true, isset($data->data[0]->count));
    $this->assertEquals(true, isset($data->data[0]->dates));
    $this->assertEquals(true, isset($data->data[0]->data));

    // Asserts correct property types on data[0].
    $this->assertEquals(true, is_numeric($data->data[0]->count));
    $this->assertEquals(true, is_array($data->data[0]->dates));
    $this->assertEquals(true, is_object($data->data[0]->data));

    // Asserts correct values on data[0].
    $this->assertEquals(count($this->statements), $data->data[0]->count);
    $this->assertEquals(count($this->statements), count($data->data[0]->dates));

    // Asserts correct properties on data[0]->data.
    $this->assertEquals(true, isset($data->data[0]->data->mbox));
    $this->assertEquals(true, isset($data->data[0]->data->objectType));

    // Asserts correct property types on data[0]->data.
    $this->assertEquals(true, is_string($data->data[0]->data->mbox));
    $this->assertEquals(true, is_string($data->data[0]->data->objectType));

    // Asserts correct property values on data[0]->data.
    $this->assertEquals('mailto:test@example.com', $data->data[0]->data->mbox);
    $this->assertEquals('Agent', $data->data[0]->data->objectType);
  }

  public function testAnalyticsVerb() {
    $response = $this->requestAnalytics(['type' => 'verb']);
    $data = $response->getData()->data;
    $this->assertEquals($data[0]->data->id, 'http://www.example.com/verbs/test');
  }

  public function testAnalyticsDay() {
    $response = $this->requestAnalytics(['interval' => 'day']);
    $data = $response->getData()->data;
    $this->assertEquals(count($this->statements), count($data));
  }

  public function testAnalyticsMonth() {
    $response = $this->requestAnalytics(['interval' => 'month']);
    $data = $response->getData()->data;
    $this->assertEquals(count($this->statements), count($data));
  }

  public function testAnalyticsYear() {
    $response = $this->requestAnalytics(['interval' => 'year']);
    $data = $response->getData()->data;
    $this->assertEquals(count($this->statements), count($data));
  }

  public function testAnalyticsSince() {
    $date = date('Y-m-d', strtotime("-1 day"));
    $response = $this->requestAnalytics(['since' => $date]);
    $data = $response->getData()->data;
    $this->assertEquals(count($this->statements), $data[0]->count);
  }

  public function testAnalyticsEmptySince() {
    $date = date('Y-m-d', strtotime("+1 day"));
    $response = $this->requestAnalytics(['since' => $date]);
    $data = $response->getData()->data;
    $this->assertEquals(true, empty($data));
  }

  public function testAnalyticsUntil() {
    $date = date('Y-m-d', strtotime("+1 day"));
    $response = $this->requestAnalytics(['until' => $date]);
    $data = $response->getData()->data;
    $this->assertEquals(count($this->statements), $data[0]->count);
  }

  public function testAnalyticsEmptyUntil() {
    $date = date('Y-m-d', strtotime("-1 day"));
    $response = $this->requestAnalytics(['until' => $date]);
    $data = $response->getData()->data;
    $this->assertEquals(true, empty($data));
  }

  public function tearDown() {
    parent::tearDown();
  }
}
