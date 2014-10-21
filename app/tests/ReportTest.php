<?php

/**
 * @file Test case for report service
 * 
 * Ensure:
 *  - User can create report
 *  - User can run report
 *  - Report works correctly
 *  - Delete report works
 */

class ReportTest extends TestCase {

  protected $lrs;
  protected $statements;
  protected $user;
  protected $data = [
    'description' => 'Some description',
    'name' => '',
    'query' => [
      'statement.actor.mbox' => [
        "mailto:duy.nguyen@go1.com.au"
      ],
      'statement.verb.id' => [
        "http://adlnet.gov/expapi/verbs/experienced"
      ]
    ],
  ];

  public function setUp() {
    parent::setUp();
    
    // Authenticates as super user.
    $user = User::first();  
    Auth::login($user);

    $this->lrs = $this->createLRS();
    $this->data['lrs'] = $this->lrs->_id;

    // Creates seven statements in the LRS.
    for ($i = 0; $i < 7; $i++) {
      $statement = $this->defaultStatment();
      $this->statements = $this->createStatement($statement, $this->lrs);
    }

    // Creates a report in the LRS.
    $this->report = $this->constructReport();
    $this->report->save();
  }

  protected function constructReport() {
    return new Report($this->data);
  }

  // API tests.
  /**
   * Creates a request to the API.
   * @param string $method HTTP method.
   * @param string $url URL to append to the API's base URL.
   * @param mixed $content Request content.
   * @return Request
   */
  protected function requestAPI($method = 'GET', $url = '', $content = '') {
    // Defines the base URL for all API requests.
    $url = '/api/v1/reports' . ($url === '' ? '' : '/') . $url;

    // Merges given headers with testing headers.
    $headers = $this->makeRequestHeaders([
      'api_key' => $this->lrs->api['basic_key'],
      'api_secret' => $this->lrs->api['basic_secret']
    ]);

    // Calls API.
    Route::enableFilters();
    return $this->call($method, $url, [], [], $headers, $content);
  }
  
  public function testIndex() {
    $response = $this->requestAPI();
    $content = json_decode($response->getContent(), true);
    $this->assertEquals(1, count($content));
  }

  public function testStore() {
    $response = $this->requestAPI('POST', '', json_encode($this->data));
    $content = json_decode($response->getContent(), true);

    // Removes properties added by the Learning Locker.
    unset($content['_id']);
    unset($content['created_at']);
    unset($content['updated_at']);

    // Checks that data and remaining content matches.
    $this->assertEquals($this->data, $content);
  }

  public function testUpdate() {
    $updatedData = $this->data;
    $updatedData['name'] = 'New name';

    $response = $this->requestAPI('PUT', $this->report->_id, json_encode($updatedData));
    $content = json_decode($response->getContent(), true);

    // Removes properties added by the Learning Locker.
    unset($content['_id']);
    unset($content['created_at']);
    unset($content['updated_at']);

    // Checks that data and remaining content matches.
    $this->assertEquals($updatedData, $content);
    
  }

  public function testShow() {
    $response = $this->requestAPI('GET', $this->report->_id);
    $content = json_decode($response->getContent(), true);

    // Removes properties added by the Learning Locker.
    unset($content['_id']);
    unset($content['created_at']);
    unset($content['updated_at']);

    // Checks that data and remaining content matches.
    $this->assertEquals($this->data, $content);
  }

  public function testDestroy() {
    $response = $this->requestAPI('DELETE', $this->report->_id);
    $content = json_decode($response->getContent(), true);
    $this->assertEquals([
      'success' => true
    ], $content);
  }

  public function testRun() {
    $id = $this->report->_id;
    $response = $this->requestAPI('GET', "$id/run");
    $content = json_decode($response->getContent(), true);

    // Checks that the correct number of statements are returned.
    $this->assertEquals(7, count($content));
  }

  public function testGraph() {
    $id = $this->report->_id;
    $response = $this->requestAPI('GET', "$id/graph");
    $content = json_decode($response->getContent(), true);
    $this->assertEquals(7, $content[0]['count']);
    $this->assertEquals(7, count($content[0]['date']));
  }

  // View tests.
  /*
  public function testRouterIndex() {
    $code = $this->call('GET', "/lrs/{$this->lrs->_id}/reporting")->getStatusCode();
    $this->assertEquals(200, $code);
  }

  public function testRouterStatements() {
    $code = $this->call('GET', "/lrs/{$this->lrs->_id}/reporting")->getStatusCode();
    $this->assertEquals(200, $code);
  }

  public function testRouterTypeahead() {
    $code = $this->call('GET', "/lrs/{$this->lrs->_id}/reporting")->getStatusCode();
    $this->assertEquals(200, $code);
  }
  */

  function tearDown() {
    parent::tearDown();
    $this->lrs->delete();
  }

}
