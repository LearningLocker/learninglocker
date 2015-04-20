<?php namespace Tests\Repos\Statement;

use \Illuminate\Foundation\Testing\TestCase as Base;
use \Locker\Repository\Statement\Formatter as Formatter;

class FormatterTest extends Base {

  public function setup() {
    parent::setup();
    $this->formatter = new Formatter();
  }

  public function createApplication() {
    $unitTesting = true;
    $testEnvironment = 'testing';
    return require __DIR__ . '/../../../../bootstrap/start.php';
  }

  private function cloneObj(\stdClass $obj) {
    return json_decode(json_encode($obj));
  }

  public function testIdentityStatements() {
    $statement = json_decode(file_get_contents(__DIR__ . '/../../fixtures/Repos/StatementFormatter1.json'));
    $formatted = $this->formatter->identityStatement($this->cloneObj($statement));

    $this->assertEquals(true, is_object($formatted));

    // Asserts correct statement properties.
    $this->assertEquals(true, isset($formatted->actor));
    $this->assertEquals(true, is_object($formatted->actor));
    $this->assertEquals(true, isset($formatted->verb));
    $this->assertEquals(true, is_object($formatted->verb));
    $this->assertEquals(true, isset($formatted->object));
    $this->assertEquals(true, is_object($formatted->object));

    // Asserts correct actor properties.
    $this->assertEquals(true, isset($formatted->actor->mbox));
    $this->assertEquals(true, is_string($formatted->actor->mbox));
    $this->assertEquals($statement->actor->mbox, $formatted->actor->mbox);
    $this->assertEquals(true, isset($formatted->actor->objectType));
    $this->assertEquals(true, is_string($formatted->actor->objectType));
    $this->assertEquals($statement->actor->objectType, $formatted->actor->objectType);
    $this->assertEquals(true, !isset($formatted->actor->name));

    // Asserts correct object properties.
    $this->assertEquals(true, isset($formatted->object->id));
    $this->assertEquals(true, is_string($formatted->object->id));
    $this->assertEquals($statement->object->id, $formatted->object->id);
    $this->assertEquals(true, isset($formatted->object->objectType));
    $this->assertEquals(true, is_string($formatted->object->objectType));
    $this->assertEquals($statement->object->objectType, $formatted->object->objectType);
    $this->assertEquals(true, !isset($formatted->object->definition));
  }

  public function testCanonicalStatements() {
    $statement = json_decode(file_get_contents(__DIR__ . '/../../fixtures/Repos/StatementFormatter1.json'));
    $formatted = $this->formatter->canonicalStatement($this->cloneObj($statement), ['en-GB']);

    $this->assertEquals(true, is_object($formatted));

    // Asserts correct statement properties.
    $this->assertEquals(true, isset($formatted->actor));
    $this->assertEquals(true, is_object($formatted->actor));
    $this->assertEquals(true, isset($formatted->verb));
    $this->assertEquals(true, is_object($formatted->verb));
    $this->assertEquals(true, isset($formatted->object));
    $this->assertEquals(true, is_object($formatted->object));

    // Asserts correct verb display.
    $this->assertEquals(true, isset($formatted->verb->display));
    $this->assertEquals(true, is_string($formatted->verb->display));
    $this->assertEquals($statement->verb->display->{'en-GB'}, $formatted->verb->display);

    // Asserts correct object definition.
    $this->assertEquals(true, isset($formatted->object->definition->name));
    $this->assertEquals(true, is_string($formatted->object->definition->name));
    $this->assertEquals($statement->object->definition->name->{'en-GB'}, $formatted->object->definition->name);
    $this->assertEquals(true, isset($formatted->object->definition->description));
    $this->assertEquals(true, is_string($formatted->object->definition->description));
    $this->assertEquals($statement->object->definition->description->{'en-GB'}, $formatted->object->definition->description);
  }
}
