<?php

class ApiV1QueryAnalyticsTest extends TestCase {

    public function setUp() {
        parent::setUp();

        Route::enableFilters();

        // Authentication as super user.
        $user = User::firstOrCreate(['email' => 'quan@ll.com']);
        Auth::login($user);

        $this->createLRS();
        
        $vs = array(
          'actor' => array(
            'objectType' => 'Agent',
            'mbox' => 'mailto:duy.nguyen@go1.com.au',
            'name' => 'quanvm'
          ),
          'verb' => array(
            "id" => "http://adlnet.gov/expapi/verbs/experienced",
            "display" => array("und" => "experienced")
          ),
          'context' => array(
            "contextActivities" => array(
              "parent" => array(
                "id" => "http://tincanapi.com/GolfExample_TCAPI",
                "objectType" => "Activity"
              ),
              "grouping" => array(
                "id" => "http://tincanapi.com/GolfExample_TCAPI",
                "objectType" => "Activity"
              )
            )
          ),
          "object" => array(
            "id" => "http://tincanapi.com/GolfExample_TCAPI/Playing/Scoring.html",
            "objectType" => "Activity",
            "definition" => array(
              "name" => array(
                "en-US" => "Scoring"
              ),
              "description" => array(
                "en-US" => "An overview of how to score a round of golf."
              ),
              'type' => 'http://activitystrea.ms/schema/1.0/badge'
            )
          ),
          "authority" => array(
            "name" => "",
            "mbox" => "mailto:quan@ll.com",
            "objectType" => "Agent"
          ),
        );


        $statement = App::make('Locker\Repository\Statement\EloquentStatementRepository');
        $statement->create(array($vs), $this->lrs);

        $vs2 = $vs;
        $vs2['object']['definition']['type'] = 'http://activitystrea.ms/schema/2.0/badge';

        $statement2 = App::make('Locker\Repository\Statement\EloquentStatementRepository');
        $statement2->create(array($vs2), $this->lrs);
    }

    /**
     * test query analytics api.
     *
     * @return void
     */
    public function testQueryAnalytics() {

        //testing response format
        $response = $this->call('GET', '/api/v1/query/analytics', array(), array(), array('PHP_AUTH_USER' => $this->lrs->api['basic_key'],
          'PHP_AUTH_PW' => $this->lrs->api['basic_secret']));

        $data = $response->getData();

        $this->assertEquals($data->version, 'v1');
        $this->assertEquals($data->route, 'api/v1/query/analytics');

        //FAILURES
        //testing params: filter
        // $filter = array(
        // 	'object.definition.type' => 'http://activitystrea.ms/schema/2.0/badge'
        // );
        // $response = $this->call('GET', '/api/v1/query/analytics', 
        // 	array('filters' => json_encode($filter)), 
        // 	array(), 
        // 	array('PHP_AUTH_USER' => $this->lrs->api['basic_key'], 
        // 		'PHP_AUTH_PW' => $this->lrs->api['basic_secret']));
        // $data = $response->getData()->data;
        // var_dump($data);
        //testing params: type:time
        $response = $this->call('GET', '/api/v1/query/analytics', array('type' => 'time'), array(), array('PHP_AUTH_USER' => $this->lrs->api['basic_key'],
          'PHP_AUTH_PW' => $this->lrs->api['basic_secret']));

        $data = $response->getData()->data;
        $this->assertEquals($data[0]->count, 2);

        //testing params: type:user
        $response = $this->call('GET', '/api/v1/query/analytics', array('type' => 'user'), array(), array('PHP_AUTH_USER' => $this->lrs->api['basic_key'],
          'PHP_AUTH_PW' => $this->lrs->api['basic_secret']));

        $data = $response->getData()->data;
        $checkTypeUser = TRUE;
        foreach ($data as $value) {
            if (!in_array($value->data->name, array('quanvm', 'quanvm2'))) {
                $checkTypeUser = FALSE;
            }
        }
        $this->assertTRUE($checkTypeUser);

        //testing params: type:verb
        $response = $this->call('GET', '/api/v1/query/analytics', array('type' => 'verb'), array(), array('PHP_AUTH_USER' => $this->lrs->api['basic_key'],
          'PHP_AUTH_PW' => $this->lrs->api['basic_secret']));

        $data = $response->getData()->data;

        $this->assertEquals($data[0]->data->id, "http://adlnet.gov/expapi/verbs/experienced");

        /**
         * 	testing params: type:interval required type = time
         * 	need an static LRS and updated statement for this test
         */
        $intervalDayLrs = Lrs::find('536b02d4c01f1325618b4567');
        if ($intervalDayLrs) {
            $response = $this->call('GET', '/api/v1/query/analytics', array('interval' => 'Day'), array(), array('PHP_AUTH_USER' => $intervalDayLrs->api['basic_key'],
              'PHP_AUTH_PW' => $intervalDayLrs->api['basic_secret']));

            $data = $response->getData()->data;
            //need 2 statements which different day
            $this->assertEquals(count($data), 2);
        }
        $intervalMonthLrs = Lrs::find('536b03bbc01f13a6618b4567');
        if ($intervalMonthLrs) {
            $response = $this->call('GET', '/api/v1/query/analytics', array('interval' => 'Month'), array(), array('PHP_AUTH_USER' => $intervalMonthLrs->api['basic_key'],
              'PHP_AUTH_PW' => $intervalMonthLrs->api['basic_secret']));

            $data = $response->getData()->data;

            //need 2 statements which different Month
            $this->assertEquals(count($data), 2);
        }
        // FAILURES
        // $intervalYearLrs = Lrs::find('536b057dc01f1377638b4567');
        // if ($intervalYearLrs) {
        // 	$response = $this->call('GET', '/api/v1/query/analytics', 
        //  	array('interval' => 'Year'), 
        //  	array(), 
        //  	array('PHP_AUTH_USER' => $intervalYearLrs->api['basic_key'], 
        //  		'PHP_AUTH_PW' => $intervalYearLrs->api['basic_secret']));
        //  $data = $response->getData()->data;
        //  var_dump($data);
        //  //need 2 statement which different Year
        //  $this->assertEquals(count($data), 2);
        // }
        $intervalWeekLrs = Lrs::find('536b05ccc01f1392638b4567');
        if ($intervalWeekLrs) {
            $response = $this->call('GET', '/api/v1/query/analytics', array('interval' => 'Year'), array(), array('PHP_AUTH_USER' => $intervalWeekLrs->api['basic_key'],
              'PHP_AUTH_PW' => $intervalWeekLrs->api['basic_secret']));

            $data = $response->getData()->data;

            //need 2 statements which different Week
            $this->assertEquals(count($data), 2);
        }

        //testing params: since
        $response = $this->call('GET', '/api/v1/query/analytics', array('since' => date('Y-m-d')), array(), array('PHP_AUTH_USER' => $this->lrs->api['basic_key'],
          'PHP_AUTH_PW' => $this->lrs->api['basic_secret']));

        $data = $response->getData()->data;

        $this->assertEquals($data[0]->count, 2);

        $response = $this->call('GET', '/api/v1/query/analytics', array('since' => date('Y-m-d', strtotime("+1 day"))), array(), array('PHP_AUTH_USER' => $this->lrs->api['basic_key'],
          'PHP_AUTH_PW' => $this->lrs->api['basic_secret']));

        $data = $response->getData()->data;

        $this->assertTrue(empty($data));

        //testing params: until
        $response = $this->call('GET', '/api/v1/query/analytics', array('until' => date('Y-m-d', strtotime("+1 day"))), array(), array('PHP_AUTH_USER' => $this->lrs->api['basic_key'],
          'PHP_AUTH_PW' => $this->lrs->api['basic_secret']));

        $data = $response->getData()->data;

        $this->assertEquals($data[0]->count, 2);

        $response = $this->call('GET', '/api/v1/query/analytics', array('until' => date('Y-m-d', strtotime("-1 day"))), array(), array('PHP_AUTH_USER' => $this->lrs->api['basic_key'],
          'PHP_AUTH_PW' => $this->lrs->api['basic_secret']));

        $data = $response->getData()->data;

        $this->assertTrue(empty($data));
    }

}
