<?php namespace Tests\Repos;

use \Illuminate\Foundation\Testing\TestCase as Base;
use \Locker\Repository\Statement\EloquentIndexer as Indexer;
use \Locker\Repository\Statement\IndexOptions as IndexOptions;

class EloquentIndexerTest extends Base {

  public function setup() {
    parent::setup();
    $this->indexer = new Indexer();
    $this->lrs = $this->createLRS();
    $this->statements = [$this->createStatement(0)];
  }

  public function createApplication() {
    $unitTesting = true;
    $testEnvironment = 'testing';
    return require __DIR__ . '/../../../../bootstrap/start.php';
  }

  private function createLrs() {
    $lrs = new \Lrs([
      'title' => 'TestLRS',
      'api' => [],
      'owner' => [],
      'users' => [],
      'domain' => '',
    ]);

    $lrs->save();
    return $lrs;
  }

  protected function createStatement($id) {
    $model = new \Statement($this->getStatement());
    $model->statement->id = ((string) $id).'0000000-0000-0000-0000-000000000000';
    $model->save();
    return $model;
  }

  private function getStatement() {
    return [
      'statement' => json_decode(file_get_contents(__DIR__ . '../../../Fixtures/statement.json')),
      'active' => true,
      'voided' => false,
      'refs' => [],
      'timestamp' => new \MongoDate(strtotime('now')),
      'lrs' => [
        '_id' => $this->lrs->_id
      ]
    ];
  }

  public function testIndex() {
    $opts = new IndexOptions([
      'lrs_id' => $this->lrs->_id
    ]);
    $result = $this->indexer->index($opts);

    $this->assertEquals(true, is_object($result));
    $this->assertEquals('Jenssegers\Mongodb\Eloquent\Builder', get_class($result));
  }

  public function testFormat() {
    $opts = new IndexOptions([
      'lrs_id' => $this->lrs->_id
    ]);
    $result = $this->indexer->index($opts);
    $result = $this->indexer->format($result, $opts);

    $this->assertEquals(true, is_object($result));
    $this->assertEquals('Illuminate\Database\Eloquent\Collection', get_class($result));
    $this->assertEquals(count($this->statements), $result->count());
    $result->each(function ($statement) {
      $this->assertEquals(true, is_array($statement));
      $this->assertEquals(true, isset($statement['id']));
      $this->assertEquals(true, is_string($statement['id']));
      $expected_statement = $this->getStatement()['statement'];
      $expected_statement->id = $statement['id'];
      $this->assertEquals(json_encode($expected_statement), json_encode($statement));
    });
  }

  public function testCount() {
    $opts = new IndexOptions([
      'lrs_id' => $this->lrs->_id
    ]);
    $result = $this->indexer->index($opts);
    $result = $this->indexer->count($result, $opts);

    $this->assertEquals(true, is_int($result));
    $this->assertEquals(count($this->statements), $result);
  }

  public function tearDown() {
    $this->lrs->delete();
    foreach ($this->statements as $statement) {
      $statement->delete();
    }
    parent::tearDown();
  }
}
