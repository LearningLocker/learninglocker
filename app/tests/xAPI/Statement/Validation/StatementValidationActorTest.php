<?php

require_once __DIR__ . '/BaseStatementValidationTest.php';

class StatementValidationActorTest extends BaseStatementValidationTest
{

  public function testMissingActor()
  {
    $results = $this->exec($this->getFixturePath() . '/Invalid/Actor/missing-actor.json');
    $this->assertEquals('failed', $results['status']);
    $this->assertEquals(
      '`actor` is a required key and is not present in core statement', trim($results['errors'][0])
    );
  }

  public function testGroupMissingMember()
  {
    $results = $this->exec($this->getFixturePath() . '/Invalid/Actor/Group/missing-member.json');
    $this->assertEquals('failed', $results['status']);
    $this->assertEquals(\Lang::get('xAPIValidation.errors.actor.valid'), trim($results['errors'][0]));
  }

  public function testGroupMemberObjectTypeIsNotAgent()
  {
    $results = $this->exec($this->getFixturePath() . '/Invalid/Actor/Group/Member/object-type-is-not-agent.json');
    $this->assertEquals('failed', $results['status']);
    $this->assertEquals(\Lang::get('xAPIValidation.errors.actor.one'), trim($results['errors'][0]));
  }

  public function testMbox()
  {
    $results = $this->exec($this->getFixturePath() . '/Invalid/Actor/Mbox/invalid-format.json');
    $this->assertEquals('failed', $results['status']);
    $this->assertEquals('`mbox` is not in the correct format in actor', trim($results['errors'][0]));
  }

}
