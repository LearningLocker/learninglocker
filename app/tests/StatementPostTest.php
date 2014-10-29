<?php

class StatementPostTest extends TestCase
{

  public function setUp()
  {
    parent::setUp();

    Route::enableFilters();

    // Authentication as super user.
    $user = User::firstOrCreate(['email' => 'quan@ll.com']);
    Auth::login($user);
  }

  private function _makeRequest($param, $method, $auth)
  {
    return $this->call($method, '/data/xAPI/statements', [], [], $this->makeRequestHeaders($auth), !empty($param) ? json_encode($param) : []);
  }

  /**
   * Make a post request to LRS
   *
   * @return void
   */
  public function testPostBehavior()
  {
    $this->createLRS();

    $vs = $this->defaultStatment();
    $result = $this->createStatement($vs, $this->lrs);

    $statement = App::make('Locker\Repository\Statement\EloquentStatementRepository');
    $createdStatement = $statement->find($result['ids'][0]);

    $param = array(
      'actor' => $createdStatement->statement['actor'],
      'verb' => $createdStatement->statement['verb'],
      'context' => $createdStatement->statement['context'],
      'object' => $createdStatement->statement['object'],
      'id' => $createdStatement->statement['id'],
      'timestamp' => $createdStatement->statement['timestamp'],
    );

    // create client for Auth Service
    $auth = [
      'api_key' => $this->lrs->api['basic_key'],
      'api_secret' => $this->lrs->api['basic_secret'],
    ];

    // case: conflict-matches
    /* @var $response Illuminate\Http\JsonResponse */
    $response = $this->_makeRequest($param, "POST", $auth);
    $this->assertEquals(204, $response->getStatusCode());
    $this->assertEmpty($response->getData());

    // case: conflict nomatch
    $param['result'] = array();
    $response = $this->_makeRequest($param, "POST", $auth);
    $responseData = $response->getData();
    $this->assertEquals(409, $response->getStatusCode());
    $this->assertTrue(property_exists($responseData, 'success') && !$responseData->success);

    // Make sure response data for the get request
    $responseGet = $this->_makeRequest(array(), "GET", $auth);
    $this->assertEquals(200, $responseGet->getStatusCode());

    // Make sure response data for the get request
    unset($param['result']);
    $responsePost = $this->_makeRequest($param, "POST", $auth);
    $this->assertEquals(204, $responsePost->getStatusCode());
  }

  /**
   * make a post request to lrs with Auth Service
   *
   * @return void
   */
  public function testPostAuthService()
  {
    $this->createLRS();

    $vs = $this->defaultStatment();
    $result = $this->createStatement($vs, $this->lrs);

    $statement = App::make('Locker\Repository\Statement\EloquentStatementRepository');
    $createdStatement = $statement->find($result['ids'][0]);

    $param = [
      'actor' => $createdStatement->statement['actor'],
      'verb' => $createdStatement->statement['verb'],
      'context' => $createdStatement->statement['context'],
      'object' => $createdStatement->statement['object'],
      'id' => $createdStatement->statement['id'],
      'timestamp' => $createdStatement->statement['timestamp'],
    ];

    // create client for Auth Service
    $auth = [
      'api_key' => $this->lrs->api['basic_key'],
      'api_secret' => $this->lrs->api['basic_secret'],
    ];

    $response = $this->_makeRequest($param, "POST", $auth);

    $responseData = $response->getContent();
    $responseStatus = $response->getStatusCode();

    $this->assertEquals(204, $responseStatus);
    $this->assertEmpty($response->getData());
  }

}
