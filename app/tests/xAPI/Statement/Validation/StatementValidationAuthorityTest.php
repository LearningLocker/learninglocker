<?php

require_once __DIR__ . '/BaseStatementValidationTest.php';

class StatementValidationAuthorityTest extends BaseStatementValidationTest
{

  public function testAuthority()
  {
    $results = $this->exec($this->getFixturePath() . '/Invalid/Authority/Member/wrong-object-type.json');
    $this->assertEquals('failed', $results['status']);
    $this->assertEquals(\Lang::get('xAPIValidation.errors.group.groups'), trim($results['errors'][0]));
  }

}
