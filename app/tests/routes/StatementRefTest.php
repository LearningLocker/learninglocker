<?php namespace Tests\Routes;
use \Tests\StatementsTestCase;

class StatementRefTest extends StatementsTestCase {
  use RouteTestTrait;

  public function setUp() {
    parent::setUp();
  }

  private function requestStatements($statements) {
    $content = json_encode($statements);
    $method = 'POST';
    $uri = '/data/xAPI/statements';
    $params = $files = [];
    $server = $this->getServer($this->ll_client);
    return $this->request($method, $uri, $params, $server, $content);
  }

  private function createReferenceStatement($reference_id, $statement = []) {
    return $this->generateStatement(array_merge($statement, [
      'object' => [
        'objectType' => 'StatementRef',
        'id' => $this->generateUUID($reference_id)
      ]
    ]));
  }

  private function createIdStatement($id, $statement = []) {
    return $this->generateStatement(array_merge($statement, [
      'id' => $this->generateUUID($id)
    ]));
  }

  private function checkStatement($id, $expected_references = [], $expected_referrers = []) {
    $uuid = $this->generateUUID($id);
    $statement = \Statement::where('lrs._id', $this->lrs->_id)->where('statement.id', '=', $uuid)->first();

    //$queries = DB::getQueryLog();

    $expected_references = array_map(function ($ref) {
      return $this->generateUUID($ref);
    }, $expected_references);

    $expected_referrers = array_map(function ($ref) {
      return $this->generateUUID($ref);
    }, $expected_referrers);

    // Checks $expected_references.
    $references = array_map(function ($ref) {
      return $ref['id'];
    }, isset($statement->refs) ? $statement->refs : []);

    // Checks $expected_referrers.
    $referrers = (new \Statement)
      ->select('statement.id')
      ->where('statement.object.id', '=', $uuid)
      ->where('statement.object.objectType', '=', 'StatementRef')
      ->get()->toArray();
    $referrers = array_map(function ($ref) {
      return $ref['statement']['id'];
    }, $referrers);

    $diff = array_diff($expected_referrers, $referrers);
    $this->assertEquals(true, empty($diff) || count($diff) === 0,
      json_encode($diff).
      json_encode($expected_referrers).
      json_encode($referrers)
    );
  }

  private function generateUUID($id) {
    $len = strlen($id);
    $start = str_repeat('0', 8 - $len);
    return $id . $start . '-0000-0000-b000-000000000000';
  }

  public function testInsert1() {
    $this->requestStatements([
      $this->createIdStatement('A', $this->createReferenceStatement('E'))
    ]);

    $this->checkStatement('A', [], []);
  }

  public function testInsert2() {
    $this->requestStatements([
      $this->createIdStatement('A', $this->createReferenceStatement('E'))
    ]);

    $this->requestStatements([
      $this->createIdStatement('C', $this->createReferenceStatement('A')),
      $this->createIdStatement('D', $this->createReferenceStatement('B'))
    ]);

    $this->checkStatement('A', [], ['C']);
    $this->checkStatement('C', ['A'], []);
    $this->checkStatement('D', [], []);
  }

  public function testInsert3() {
    $this->requestStatements([
        $this->createIdStatement('A', $this->createReferenceStatement('E'))
    ]);

    $this->requestStatements([
        $this->createIdStatement('C', $this->createReferenceStatement('A')),
        $this->createIdStatement('D', $this->createReferenceStatement('B'))
    ]);

    $this->requestStatements([
      $this->createIdStatement('B', $this->createReferenceStatement('A'))
    ]);

    $this->checkStatement('A', [], ['B', 'C']);
    $this->checkStatement('B', ['A'], ['D']);
    $this->checkStatement('C', ['A'], []);
    $this->checkStatement('D', ['B', 'A'], []);
  }

  public function testInsert4() {
    $this->requestStatements([
        $this->createIdStatement('A', $this->createReferenceStatement('E'))
    ]);

    $this->requestStatements([
        $this->createIdStatement('C', $this->createReferenceStatement('A')),
        $this->createIdStatement('D', $this->createReferenceStatement('B'))
    ]);

    $this->requestStatements([
        $this->createIdStatement('B', $this->createReferenceStatement('A'))
    ]);

    $this->requestStatements([
      $this->createIdStatement('E', $this->createReferenceStatement('D'))
    ]);

    $this->checkStatement('A', ['E', 'D', 'B'], ['B', 'C']);
    $this->checkStatement('B', ['A', 'E', 'D'], ['D']);
    $this->checkStatement('C', ['A', 'E', 'D', 'B'], []);
    $this->checkStatement('D', ['B', 'A', 'E'], ['E']);
    $this->checkStatement('E', ['D', 'B', 'A'], ['A']);
  }

  public function tearDown() {
    parent::tearDown();
  }

}
