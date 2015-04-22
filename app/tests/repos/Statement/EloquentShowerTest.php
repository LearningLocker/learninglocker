<?php namespace Tests\Repos\Statement;

use \Locker\Repository\Statement\EloquentShower as Shower;
use \Locker\Repository\Statement\ShowOptions as ShowOptions;

class EloquentShowerTest extends EloquentTest {

  public function setup() {
    parent::setup();
    $this->shower = new Shower();
  }

  public function testShow() {
    $opts = new ShowOptions([
      'lrs_id' => $this->lrs->_id
    ]);
    $result = $this->shower->show('00000000-0000-0000-0000-000000000000', $opts);

    $this->assertEquals(true, is_object($result));
    $this->assertEquals('stdClass', get_class($result));
    $this->assertStatementMatch($this->statements[0]->statement, $result);
  }

  public function testShowInactive() {
    $opts = new ShowOptions([
      'lrs_id' => $this->lrs->_id,
      'active' => false
    ]);
    $model = $this->createStatement(1);
    $model->active = false;
    $model->save();
    $result = $this->shower->show('10000000-0000-0000-0000-000000000000', $opts);

    $this->assertEquals(true, is_object($result));
    $this->assertEquals('stdClass', get_class($result));
    $this->assertStatementMatch($model->statement, $result);
  }

  public function testShowVoided() {
    $opts = new ShowOptions([
      'lrs_id' => $this->lrs->_id,
      'voided' => true
    ]);
    $model = $this->createStatement(1);
    $model->voided = true;
    $model->save();
    $result = $this->shower->show('10000000-0000-0000-0000-000000000000', $opts);

    $this->assertEquals(true, is_object($result));
    $this->assertEquals('stdClass', get_class($result));
    $this->assertStatementMatch($model->statement, $result);
  }

  public function testShowInactiveVoided() {
    $opts = new ShowOptions([
      'lrs_id' => $this->lrs->_id,
      'active' => false,
      'voided' => true
    ]);
    $model = $this->createStatement(1);
    $model->active = false;
    $model->voided = true;
    $model->save();
    $result = $this->shower->show('10000000-0000-0000-0000-000000000000', $opts);

    $this->assertEquals(true, is_object($result));
    $this->assertEquals('stdClass', get_class($result));
    $this->assertStatementMatch($model->statement, $result);
  }

  private function assertStatementMatch(\stdClass $statement_a, \stdClass $statement_b) {
    unset($statement_b->version);
    $this->assertEquals(true, $statement_a == $statement_b);
  }
}
