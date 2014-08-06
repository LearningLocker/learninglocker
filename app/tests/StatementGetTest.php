<?php

class StatementGetTest extends TestCase
{

  public function setUp()
  {
    parent::setUp();

    Route::enableFilters();

    // Authentication as super user.
    $user = User::firstOrCreate(['email' => 'quan@ll.com']);
    Auth::login($user);
  }

  private function _makeRequest($auth, $version)
  {
    return $this->call("GET", '/data/xAPI/statements', [], [], [
        'PHP_AUTH_USER'                 => $auth['api_key'],
        'PHP_AUTH_PW'                   => $auth['api_secret'],
        'HTTP_X-Experience-API-Version' => $version
      ]
    );
  }

  /**
   * Create statements for lrs
   *
   * @param string $version Make sure LRS response to all valid version.
   * @return void
   * @dataProvider dataGetAuthService
   */
  public function testGetAuthService($version, $expecting_code)
  {
    $lrs = $this->createLRS();

    // create client for Auth Service
    $auth = [
      'api_key' => $this->lrs->api['basic_key'],
      'api_secret' => $this->lrs->api['basic_secret'],
    ];


    // Make sure response data for the get request
    $response = $this->_makeRequest($auth, $version);
    $this->assertEquals($expecting_code, $response->getStatusCode());

    $lrs->delete();
  }

  public function dataGetAuthService() {
    $data = [];

    foreach (range(0, 20) as $i) {
      if (array_rand([true, false])) {
        $data[] = ["1.0.{$i}", 200];
      }
    }

    //$data[] = ["0.9", 400];
    //$data[] = ["1.1", 400];

    return $data;
  }
}
