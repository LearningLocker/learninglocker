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

  public function setUp() {
    parent::setUp();
    // Authentication as super user.
    $user = User::first();  
    Auth::login($user);  
    $this->createLRS();
  }

  /**
   * lrs/{id}/reporting/create  
   * 
   * This test case create new reporting and run report
   * 
   * It is ensure reporting work correctly.
   * */
  public function testRouterReportCreate() {
    for ($i = 0; $i < 7; $i++) {
      $vs = $this->defaultStatment();
      $this->statements[] = $this->createStatement($vs, $this->lrs);
    }
    $data = array(
      'description' => \app\locker\helpers\Helpers::getRandomValue(),
      'name' => '',
      'lrs' => $this->lrs->_id,
      'query' => array(
        'statement.actor.mbox' => array(
          "mailto:duy.nguyen@go1.com.au"
        ),
        'statement.verb.id' => array(
          "http://adlnet.gov/expapi/verbs/experienced"
        )
      ),
    );
    //lrs input validation
    $rules['name']         = 'required|alpha_spaces';
    $rules['description']  = 'alpha_spaces';
    $validator = Validator::make($data, $rules);
    $this->assertTrue($validator->fails());
    
    $data['name'] = 'reportabcd';
    $data['description'] = 'reportabcd description';
    $validator = Validator::make($data, $rules);
    $this->assertTrue($validator->passes());

    // create report.
    $report = new Report;
    $report->lrs = $data['lrs'];
    $report->query = $data['query'];
    $report->name  = $data['name'];
    $report->description = $data['description'];
    $save = $report->save();
    $this->assertTrue($save);
    
    // Ensure report show in reporting page.
    $crawler = $this->client->request('GET', "/lrs/{$this->lrs->_id}/reporting");
    $this->assertGreaterThan(0, $crawler->filter('html:contains("reportabcd")')->count());
    $this->assertGreaterThan(0, $crawler->filter('html:contains("reportabcd description")')->count());
    
    $crawler = $this->client->request('GET', "/lrs/{$this->lrs->_id}/reporting/show/{$report->_id}");
    $this->assertGreaterThan(0, $crawler->filter('html:contains("Number of statements")')->count());
    $this->assertGreaterThan(0, $crawler->filter('html:contains("7")')->count());
    
    // Delete report by router.
    $crawler = $this->client->request('DELETE', "/lrs/{$this->lrs->_id}/reporting/delete/{$report->_id}");
    $this->assertEquals(Report::find($report->_id), NULL);

  }

  /**
   * lrs/{id}/reporting/statements
   * Ensure report statement of lrs work correctly
   */
  public function testRouterReportStatements() {
    for ($i = 0; $i < 5; $i++) {
      $vs = $this->defaultStatment();
      $this->statements[] = $this->createStatement($vs, $this->lrs);
    }
    $crawler = $this->client->request('GET', "/lrs/{$this->lrs->_id}/reporting/statements?filter={}");
    $this->assertTrue($this->client->getResponse()->isOk());
    
    $json = $this->client->getResponse()->getContent();
    $result = json_decode($json);
    $this->assertEquals(5, count($result));
  }

  /**
   * lrs/{id}/reporting/data
   * Test run report
   */
  function testReportRun() {
    // Router run report.
    for ($i = 0; $i < 3; $i++) {
      $vs = $this->defaultStatment();
      $this->statements[] = $this->createStatement($vs, $this->lrs);
    }
    $crawler = $this->client->request('GET', "/lrs/{$this->lrs->_id}/reporting/data?filter={}");
    $this->assertTrue($this->client->getResponse()->isOk());
    
    $json = $this->client->getResponse()->getContent();
    $result = json_decode($json);
    $this->assertEquals(3, count($result[0]->date));
    $this->assertEquals(3, $result[0]->count);
    
    // @see RoutingServiceProvider.php line 35.
    Route::enableFilters();
    $crawler = $this->client->request('GET', "/lrs/{$this->lrs->_id}/reporting/data?filter={\"statement.verb.id\":[\"http://adlnet.gov/expapi/verbs/attempted\"]}");
    $json = $this->client->getResponse()->getContent();
    $result = json_decode($json);
    $this->assertEquals(0, count($result));

    for ($i = 0; $i < 4; $i++) {
      $vs = $this->defaultStatment();
      $vs['verb'] = array(
        "id" => "http://adlnet.gov/expapi/verbs/attempted",
        "display" => array("und" => "attempted")
      );
      $this->statements[] = $this->createStatement($vs, $this->lrs);
    }
    $crawler = $this->client->request('GET', "/lrs/{$this->lrs->_id}/reporting/data?filter={\"statement.verb.id\":[\"http://adlnet.gov/expapi/verbs/attempted\"]}");
    $json = $this->client->getResponse()->getContent();
    $result = json_decode($this->client->getResponse()->getContent());
    $this->assertEquals(4, count($result[0]->date));
    
    // Service run report.
  }

  function tearDown() {
    parent::tearDown();
    // Delete data.
    $this->lrs->delete();
  }

}
