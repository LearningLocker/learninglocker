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
      'lrs_id' => $this->lrs->_id,
      'client' => $this->ll_client,
      'scopes' => $this->ll_client->scopes
    ]);
    $result = $this->shower->show('00000000-0000-0000-b000-000000000000', $opts);

    $this->assertEquals(true, is_object($result));
    $this->assertEquals('stdClass', get_class($result));
    $this->assertStatementMatch($this->statements[0]->statement, $result);
  }

  public function testShowInactive() {
    $opts = new ShowOptions([
      'lrs_id' => $this->lrs->_id,
      'active' => false,
      'client' => $this->ll_client,
      'scopes' => $this->ll_client->scopes
    ]);
    $model = $this->statements[0];
    $model->active = false;
    $model->save();
    $result = $this->shower->show('00000000-0000-0000-b000-000000000000', $opts);

    $this->assertEquals(true, is_object($result));
    $this->assertEquals('stdClass', get_class($result));
    $this->assertStatementMatch($model->statement, $result);
  }

  public function testShowVoided() {
    $opts = new ShowOptions([
      'lrs_id' => $this->lrs->_id,
      'voided' => true,
      'client' => $this->ll_client,
      'scopes' => $this->ll_client->scopes
    ]);
    $model = $this->statements[0];
    $model->voided = true;
    $model->save();
    $result = $this->shower->show('00000000-0000-0000-b000-000000000000', $opts);

    $this->assertEquals(true, is_object($result));
    $this->assertEquals('stdClass', get_class($result));
    $this->assertStatementMatch($model->statement, $result);
  }

  public function testShowInactiveVoided() {
    $opts = new ShowOptions([
      'lrs_id' => $this->lrs->_id,
      'active' => false,
      'voided' => true,
      'client' => $this->ll_client,
      'scopes' => $this->ll_client->scopes
    ]);
    $model = $this->statements[0];
    $model->active = false;
    $model->voided = true;
    $model->save();
    $result = $this->shower->show('00000000-0000-0000-b000-000000000000', $opts);

    $this->assertEquals(true, is_object($result));
    $this->assertEquals('stdClass', get_class($result));
    $this->assertStatementMatch($model->statement, $result);
  }

  private function assertStatementMatch(array $statement_a, \stdClass $statement_b) {
    $this->assertEquals(true, json_decode(json_encode($statement_a)) == $statement_b);
  }
}
