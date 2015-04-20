<?php namespace Tests;
use \Locker\Helpers\Helpers as Helpers;

abstract class StatementsTestCase extends LrsTestCase {
  protected $statements;

  public function setUp() {
    parent::setUp();
    $this->statements = [$this->createStatement(
      $this->lrs,
      $this->generateStatement()
    )];
  }

  protected function generateStatement($statement = []) {
    $timestamp = Helpers::getCurrentDate();
    return [
      'actor' => [
        'mbox' => 'mailto:test@example.com',
        'objectType' => 'Agent'
      ],
      'verb' => [
        'id' => 'http://www.example.com/verbs/test'
      ],
      'object' => [
        'id' => 'http://www.example.com/objects/test',
        'objectType' => 'Activity'
      ],
      'timestamp' => $timestamp,
      'stored' => $timestamp,
      'authority' => [
        'mbox' => 'mailto:test@example.com',
        'objectType' => 'Agent'
      ]
    ];
  }

  protected function createStatement(\Lrs $lrs, array $statement) {
    $model = new \Statement(array_merge([
      'lrs' => ['_id' => $lrs->_id],
      'statement' => $statement,
      'active' => true,
      'voided' => false,
      'refs' => []
    ], $statement));
    $model->timestamp = new \MongoDate(strtotime($model->statement['timestamp']));
    $model->save();
    return $model;
  }

  public function tearDown() {
    array_map(function ($statement) {
      $statement->delete();
    }, $this->statements);
    parent::tearDown();
  }
}
