<?php

require_once __DIR__ . '/BaseStatementValidationTest.php';

class StatementValidationActorTest extends BaseStatementValidationTest
{

  public function testMissingActor()
  {
    $results = $this->exec($this->getFixturePath() . '/Invalid/Actor/missing-actor.json');
    $this->assertEquals('failed', $results['status']);
    $this->assertEquals(
      \Lang::get('xAPIValidation.errors.required', array(
        'key' => 'actor',
        'section' => 'core statement'
      )), trim($results['errors'][0])
    );
  }

  public function testGroupMissingMember()
  {
    $results = $this->exec($this->getFixturePath() . '/Invalid/Actor/Group/missing-member.json');
    $this->assertEquals('failed', $results['status']);
    $this->assertEquals(\Lang::get('xAPIValidation.errors.required', array(
      'key' => 'member',
      'section' => 'actor'
    )), trim($results['errors'][0]));
  }

  public function testGroupMemberObjectTypeIsNotAgent()
  {
    $results = $this->exec($this->getFixturePath() . '/Invalid/Actor/Group/Member/object-type-is-not-agent.json');
    $this->assertEquals('failed', $results['status']);
    $this->assertEquals(\Lang::get('xAPIValidation.errors.group.groups'), trim($results['errors'][0]));
  }

  public function testMbox()
  {
    $results = $this->exec($this->getFixturePath() . '/Invalid/Actor/Mbox/invalid-format.json');
    $this->assertEquals('failed', $results['status']);
    $this->assertEquals(
      \Lang::get('xAPIValidation.errors.format', array(
        'key' => 'mbox',
        'section' => 'actor'
      )), trim($results['errors'][0]));
  }

}
