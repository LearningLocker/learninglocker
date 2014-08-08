<?php

require_once __DIR__ . '/BaseStatementValidationTest.php';

class StatementValidationAuthorityTest extends BaseStatementValidationTest
{

  public function testAuthority()
  {
    $results = $this->exec($this->getFixturePath() . '/Invalid/Authority/Member/wrong-object-type.json');
    $this->assertEquals('failed', $results['status']);
    $this->assertEquals(
      'Invalid object with characteristics of a Group when an Agent was expected.', trim($results['errors'][0])
    );
  }

}
