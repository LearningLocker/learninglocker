<?php namespace Tests\Repos\Statement;

use \Illuminate\Foundation\Testing\TestCase as Base;

abstract class EloquentTest extends Base {

  public function setup() {
    parent::setup();
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

  protected function getStatement() {
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

  public function tearDown() {
    $this->lrs->delete();
    foreach ($this->statements as $statement) {
      $statement->delete();
    }
    parent::tearDown();
  }
}
