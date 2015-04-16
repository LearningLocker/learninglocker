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
}
