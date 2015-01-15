<?php

class ApiV1QueryAnalyticsTest extends TestCase {

  public function setUp() {
    // Calls parent setup.
    parent::setUp();

    // Authenticates as super user.
    Route::enableFilters();
    $user = User::firstOrCreate(['email' => 'quan@ll.com']);
    Auth::login($user);
    $this->createLRS();
    
    // Creates testing statements.
    $vs = json_decode(file_get_contents(__DIR__ . '/Fixtures/Analytics.json'), true);
    $statement = App::make('Locker\Repository\Statement\EloquentStatementRepository');
    $statement->create([json_decode(json_encode($vs))], $this->lrs);

    $vs2 = $vs;
    $vs2['object']['definition']['type'] = 'http://activitystrea.ms/schema/2.0/badge';

    $statement2 = App::make('Locker\Repository\Statement\EloquentStatementRepository');
    $statement2->create([json_decode(json_encode($vs2))], $this->lrs);
  }

  private function callResponse($params = [], $lrs) {
    $auth = [
      'PHP_AUTH_USER' => $lrs->api['basic_key'],
      'PHP_AUTH_PW' => $lrs->api['basic_secret']
    ];
    $route = '/api/v1/query/analytics';

    return $this->call('GET', $route, $params, [], $auth);
  }

  public function testDefaultQuery() {
    $response = $this->callResponse([], $this->lrs);
    $data = $response->getData();
    $this->assertEquals($data->version, 'v1');
    $this->assertEquals($data->route, 'api/v1/query/analytics');
  }

  public function testTimeQuery() {
    $response = $this->callResponse(['type' => 'time'], $this->lrs);
    $data = $response->getData()->data;
    $this->assertEquals($data[0]->count, 2);
  }

  public function testUserQuery() {
    $response = $this->callResponse(['type' => 'user'], $this->lrs);

    $data = $response->getData()->data;
    $checkTypeUser = TRUE;
    foreach ($data as $value) {
        if (!in_array($value->data->name, array('quanvm', 'quanvm2'))) {
            $checkTypeUser = FALSE;
        }
    }
    $this->assertTRUE($checkTypeUser);
  }

  public function testVerbQuery() {
    $response = $this->callResponse(['type' => 'verb'], $this->lrs);
    $data = $response->getData()->data;
    $this->assertEquals($data[0]->data->id, "http://adlnet.gov/expapi/verbs/experienced");
  }

  public function testDayQuery() {
    $intervalLrs = Lrs::find('536b02d4c01f1325618b4567');
    if ($intervalLrs) {
      $response = $this->callResponse(['interval' => 'Day'], $intervalLrs);
      $data = $response->getData()->data;
      $this->assertEquals(count($data), 2);
    }
  }

  public function testMonthQuery() {
    $intervalLrs = Lrs::find('536b03bbc01f13a6618b4567');
    if ($intervalLrs) {
      $response = $this->callResponse(['interval' => 'Month'], $intervalLrs);
      $data = $response->getData()->data;
      $this->assertEquals(count($data), 2);
    }
  }

  public function testYearQuery() {
    $intervalLrs = Lrs::find('536b05ccc01f1392638b4567');
    if ($intervalLrs) {
      $response = $this->callResponse(['interval' => 'Year'], $intervalLrs);
      $data = $response->getData()->data;
      $this->assertEquals(count($data), 2);
    }
  }

  public function testSinceQuery() {
    $response = $this->callResponse(['since' => date('Y-m-d')], $this->lrs);
    $data = $response->getData()->data;
    $this->assertEquals($data[0]->count, 2);
  }

  public function testEmptySinceQuery() {
    $date = date('Y-m-d', strtotime("+1 day"));
    $response = $this->callResponse(['since' => $date], $this->lrs);
    $data = $response->getData()->data;
    $this->assertTrue(empty($data));
  }

  public function testUntilQuery() {
    $date = date('Y-m-d', strtotime("+1 day"));
    $response = $this->callResponse(['until' => $date], $this->lrs);
    $data = $response->getData()->data;
    $this->assertEquals($data[0]->count, 2);
  }

  public function testEmptyUntilQuery() {
    $date = date('Y-m-d', strtotime("-1 day"));
    $response = $this->callResponse(['until' => $date], $this->lrs);
    $data = $response->getData()->data;
    $this->assertTrue(empty($data));
  }
}
