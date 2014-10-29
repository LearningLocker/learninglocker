<?php

class ReportTest extends TestCase {

  // Defines the number of test statements to be used.
  const STATEMENTS = 7;

  // Defines the data required by multiple tests.
  protected $lrs, $report;
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

  /**
   * Sets up the tests.
   */
  public function setUp() {
    parent::setUp();
    
    // Authenticates as super user.
    $user = User::first();  
    Auth::login($user);

    $this->lrs = $this->createLRS();
    $this->data['lrs'] = $this->lrs->_id;

    // Creates seven statements in the LRS.
    for ($i = 0; $i < self::STATEMENTS; $i++) {
      $this->createStatement($this->defaultStatment(), $this->lrs);
    }

    // Creates a report in the LRS.
    $this->report = $this->constructReport();
    $this->report->save();
  }

  /**
   * Constructs a new report with test data.
   * @return Report Constructed report.
   */
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
  
  /**
   * Tests the index endpoint on the API.
   */
  public function testIndex() {
    $response = $this->requestAPI();
    $content = json_decode($response->getContent(), true);
    $this->assertEquals(1, count($content));
  }

  /**
   * Tests the store endpoint on the API.
   */
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

  /**
   * Tests the update endpoint on the API.
   */
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

  /**
   * Tests the show endpoint on the API.
   */
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

  /**
   * Tests the destroy endpoint on the API.
   */
  public function testDestroy() {
    $response = $this->requestAPI('DELETE', $this->report->_id);
    $content = json_decode($response->getContent(), true);
    $this->assertEquals([
      'success' => true
    ], $content);
  }

  /**
   * Tests the run endpoint on the API.
   */
  public function testRun() {
    $response = $this->requestAPI('GET', "{$this->report->_id}/run");
    $content = json_decode($response->getContent(), true);

    // Checks that the correct number of statements are returned.
    $this->assertEquals(self::STATEMENTS, count($content));
  }

  /**
   * Tests the graph endpoint on the API.
   */
  public function testGraph() {
    $response = $this->requestAPI('GET', "{$this->report->_id}/graph");
    $content = json_decode($response->getContent(), true);

    // Checks that the correct number of statements are returned.
    $this->assertEquals(self::STATEMENTS, $content[0]['count']);
    $this->assertEquals(self::STATEMENTS, count($content[0]['date']));
  }

  // View tests.
  /**
   * Creates a request to the views.
   * @param string $method HTTP method.
   * @param string $url URL to append to the API's base URL.
   * @param mixed $content Request content.
   * @return Request
   */
  protected function requestView($url = '') {
    // Defines the base URL for all API requests.
    $url = "/lrs/{$this->lrs->_id}/reporting" . ($url === '' ? '' : '/') . $url;

    // Merges given headers with testing headers.
    $headers = $this->makeRequestHeaders([
      'api_key' => $this->lrs->api['basic_key'],
      'api_secret' => $this->lrs->api['basic_secret']
    ]);

    // Calls API.
    Route::enableFilters();
    return $this->call('GET', $url, [], [], $headers, '');
  }
  
  /**
   * Tests the index endpoint in views.
   */
  public function testRouterIndex() {
    $code = $this->requestView()->getStatusCode();
    $this->assertEquals(200, $code);
  }

  /**
   * Tests the statements endpoint in views.
   */
  public function testRouterStatements() {
    $code = $this->requestView("{$this->report->_id}/statements")->getStatusCode();
    $this->assertEquals(200, $code);
  }

  /**
   * Tests the typeahead endpoint in views for actors.
   */
  public function testRouterActorTypeahead() {
    $actor = $this->defaultStatment()['actor'];
    $response = $this->requestView("typeahead/actors/{$actor['name']}");
    $content = json_decode($response->getContent(), true);

    // Checks that response content matches the default statement's actor.
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertEquals($actor, $content[0]);
  }

  /**
   * Destroys the data used by the tests.
   */
  function tearDown() {
    parent::tearDown();
    $this->lrs->delete();
  }

}
