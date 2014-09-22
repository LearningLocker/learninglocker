<?php

require_once __DIR__ . '/BaseStatementValidationTest.php';

class StatementValidationTest extends BaseStatementValidationTest
{

  /**
   * @dataProvider dataProviderSimple
   */
  public function testSimple($path)
  {
    $results = $this->exec($path);
    $this->assertEquals('passed', $results['status']);
    $this->assertEmpty($results['errors']);

    $short_path = substr($path, strpos($path, '/Fixtures/Statements/Valid/') + 27, -5);
    $extra_method = str_replace(['//', '/', '-'], ' ', trim($short_path, '/'));
    $extra_method = 'extraChecking' . str_replace(' ', '', ucwords($extra_method));
    if (method_exists($this, $extra_method)) {
      $this->{$extra_method}($results);
    }
  }

  protected function extraCheckingActorGroup($results)
  {
    $this->assertEquals($this->json_input['actor']['member'], $results['statement']['actor']['member']);
  }

  public function dataProviderSimple()
  {
    $data = [];

    foreach (['', 'Actor', 'Object', 'Verb/Display'] as $k) {
      foreach (glob($this->getFixturePath() . "/Valid/{$k}/*.json") as $file) {
        $data[][] = $file;
      }
    }

    return $data;
  }

}
