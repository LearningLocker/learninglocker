<?php

class StatementPutTest extends TestCase
{

  public function setUp()
  {
    parent::setUp();

    Route::enableFilters();

    // Authentication as super user.
    $user = User::firstOrCreate(['email' => 'quan@ll.com']);
    Auth::login($user);
  }

  private function _makeRequest($param, $auth)
  {
    return $this->call('PUT', '/data/xAPI/statements', ['statementId' => $param['id']], [], $this->makeRequestHeaders($auth), json_encode($param));
  }

  /**
   * Create statements for lrs
   *
   * @return void
   */
  public function testPutBehavior()
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
    $response = $this->_makeRequest($param, $auth);
    $responseData = method_exists($response, 'getData');
    $responseStatus = $response->getStatusCode();

    $this->assertEquals(204, $responseStatus);
    $this->assertEquals(false, $responseData);

    // case: conflict nomatch
    $param['result'] = new \stdClass();
    try {
      $response = $this->_makeRequest($param, $auth);
    } catch (\Exception $ex) {
      $this->assertEquals(409, $ex->getCode());
    }
  }

  /**
   * Create statements for lrs with Auth Service
   *
   * @return void
   */
  public function testPutAuthService()
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
    // create client for Auth Service
    $auth = [
      'api_key' => $this->lrs->api['basic_key'],
      'api_secret' => $this->lrs->api['basic_secret'],
    ];

    $response = $this->_makeRequest($param, $auth);
    $responseData = method_exists($response, 'getData');
    $responseStatus = $response->getStatusCode();

    $this->assertEquals(204, $responseStatus);
    $this->assertEquals(false, $responseData);
  }

  public function tearDown()
  {
    parent::tearDown();

    // Need LRS table is empty because waiting the getLrsBySubdomain()
    if ($this->lrs) {
      $this->lrs->delete();
    }
  }

}
