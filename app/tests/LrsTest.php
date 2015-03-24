<?php

class LrsTest extends TestCase
{

  public function setUp()
  {
    parent::setUp();

    Route::enableFilters();

    // Authentication as super user.
    $user = User::firstOrCreate(['email' => 'quan@ll.com']);
    Auth::login($user);
  }

  /**
   * Test LRS
   */
  public function testLRS()
  {
    $lrs = new Lrs;

    // Test title required.
    $values = array(
      'title' => '',
      'description' => \Locker\Helpers\Helpers::getRandomValue(),
      'api' => array('basic_key' => \Locker\Helpers\Helpers::getRandomValue(),
        'basic_secret' => \Locker\Helpers\Helpers::getRandomValue())
    );
    $validator = $lrs->validate($values);
    $this->assertTrue($validator->fails());
    $this->assertFalse($validator->passes());

    $values['title'] = \Locker\Helpers\Helpers::getRandomValue();
    $validator = $lrs->validate($values);
    $this->assertTrue($validator->passes());

    // Validate auth_service

    $values['auth_service_url'] = 'http://' . \Locker\Helpers\Helpers::getRandomValue() . '.adurolms.com';
    $validator = $lrs->validate($values);
    $this->assertTrue($validator->passes());

    // Add new lrs
    $lrs->title = $values['title'];
    $lrs->description = $values['description'];
    $lrs->api = $values['api'];
    $result = $lrs->save();
    $this->assertTrue($result);

    // Load lrs from db
    $lrs_id = $lrs->_id;
    $db_lrs = Lrs::find($lrs_id);
    $this->assertEquals($db_lrs->_id, $lrs->_id);

    // Edit lrs
    $title = \Locker\Helpers\Helpers::getRandomValue();
    $db_lrs->title = $title;
    $db_lrs->save();
    $this->assertEquals($db_lrs->title, $title);

    // Delete lrs
    $db_lrs->delete();
    $this->assertEquals(Lrs::find($lrs_id), NULL, 'delete lrs');
  }

  public function testInternalAuthentication()
  {
    $this->createLRS();

    //create client for Auth Service
    $auth = [
      'api_key' => $this->lrs->api['basic_key'],
      'api_secret' => $this->lrs->api['basic_secret'],
    ];

    $response = $this->_makeRequest($auth);
    $this->assertEquals($response->getStatusCode(), 200);
  }

  public function testAuthenticationService()
  {
    $this->createLRS();

    //create client for Auth Service
    $auth = [
      'api_key' => $this->lrs->api['basic_key'],
      'api_secret' => $this->lrs->api['basic_secret'],
    ];

    // Make sure response data for the get request
    $response = $this->_makeRequest($auth, ['auth_type' => 'central']);
    $this->assertEquals($response->getStatusCode(), 200);
  }

  private function _makeRequest($auth, $param = [])
  {
    return $this->call("GET", '/data/xAPI/statements', $param, [], $this->makeRequestHeaders($auth));
  }

  public function testEnpoint()
  {
    $this->assertTrue(true);
  }

}
