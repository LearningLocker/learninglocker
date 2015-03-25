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
    $createdStatement = $statement->show($this->lrs->_id, $result[0])->first();

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
    $this->assertEquals(200, $response->getStatusCode());

    // case: conflict nomatch
    $param['result'] = new \stdClass();
    try {
      $response = $this->_makeRequest($param, "POST", $auth);
    } catch (\Exception $ex) {
      $this->assertEquals(409, $ex->getCode());
    }

    // Make sure response data for the get request
    $responseGet = $this->_makeRequest(new \stdClass(), "GET", $auth);
    $this->assertEquals(200, $responseGet->getStatusCode());

    // Make sure response data for the get request
    unset($param['result']);
    $responsePost = $this->_makeRequest($param, "POST", $auth);
    $this->assertEquals(200, $responsePost->getStatusCode());
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
    $createdStatement = $statement->show($this->lrs->_id, $result[0])->first();

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

    $this->assertEquals(200, $responseStatus);
  }

}
