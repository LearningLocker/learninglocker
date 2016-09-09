<?php namespace Tests\Routes;
use \Tests\StatementsTestCase;

class StatementsVersionTest extends StatementsTestCase {
  use RouteTestTrait;

  public function setUp() {
    parent::setUp();
  }

  private function requestStatements($statements) {
    $content = json_encode($statements);
    $method = 'POST';
    $uri = '/data/xAPI/statements';
    $params = $files = [];
    $server = $this->getServer($this->ll_client, '1.0');
    return $this->request($method, $uri, $params, $server, $content);
  }

  public function testInsert1() {
    $this->requestStatements([$this->generateStatement()]);
  }

  public function tearDown() {
    parent::tearDown();
  }

}
