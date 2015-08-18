<?php namespace Tests\Repos\Statement;

use \Locker\Repository\Statement\EloquentIndexer as Indexer;
use \Locker\Repository\Statement\IndexOptions as IndexOptions;

class EloquentIndexerTest extends EloquentTest {

  public function setup() {
    parent::setup();
    $this->indexer = new Indexer();
  }

  public function testIndex() {
    $opts = new IndexOptions([
      'lrs_id' => $this->lrs->_id,
      'client' => $this->ll_client,
      'scopes' => $this->ll_client->scopes
    ]);
    $result = $this->indexer->index($opts);

    $this->assertEquals(true, is_object($result));
    $this->assertEquals('Jenssegers\Mongodb\Eloquent\Builder', get_class($result));
  }

  public function testFormat() {
    $opts = new IndexOptions([
      'lrs_id' => $this->lrs->_id,
      'client' => $this->ll_client,
      'scopes' => $this->ll_client->scopes
    ]);
    $result = $this->indexer->index($opts);
    $result = $this->indexer->format($result, $opts);

    $this->assertEquals(true, is_array($result));
    $this->assertEquals(count($this->statements), count($result));
    foreach ($result as $statement) {
      $this->assertEquals(true, is_object($statement));
      $this->assertEquals(true, isset($statement->id));
      $this->assertEquals(true, is_string($statement->id));
      $expected_statement = $this->statements[0]->statement;
      $this->assertStatementMatch($expected_statement, $statement);
    }
  }

  public function testCount() {
    $opts = new IndexOptions([
      'lrs_id' => $this->lrs->_id,
      'client' => $this->ll_client,
      'scopes' => $this->ll_client->scopes
    ]);
    $result = $this->indexer->index($opts);
    $result = $this->indexer->count($result, $opts);

    $this->assertEquals(true, is_int($result));
    $this->assertEquals(count($this->statements), $result);
  }

  public function testAgentAccount() {
    // Defines the test agent.
    $agent = (object) [
      'account' => (object) [
        'homePage' => 'http://www.example.com/users',
        'name' => '1'
      ],
      'objectType' => 'Agent'
    ];

    // Updates the already inserted model with the test agent.
    $model = $this->statements[0];
    $model->statement = $this->generateStatement([
      'actor' => $agent
    ]);
    $model->save();

    // Uses the repo.
    $opts = new IndexOptions([
      'lrs_id' => $this->lrs->_id,
      'agent' => $agent,
      'client' => $this->ll_client,
      'scopes' => $this->ll_client->scopes
    ]);
    $result = $this->indexer->index($opts);
    $result = $this->indexer->format($result, $opts);

    // Checks the result is correct.
    $this->assertEquals(true, is_array($result));
    $this->assertEquals(count($this->statements), count($result));
    foreach ($result as $statement) {
      $this->assertEquals(true, is_object($statement));
      $this->assertEquals(true, isset($statement->id));
      $this->assertEquals(true, is_string($statement->id));
      $expected_statement = $this->statements[0]->statement;
      $this->assertStatementMatch($expected_statement, $statement);
    }
  }

  private function assertStatementMatch(array $statement_a, \stdClass $statement_b) {
    $this->assertEquals(true, json_decode(json_encode($statement_a)) == $statement_b);
  }
}
