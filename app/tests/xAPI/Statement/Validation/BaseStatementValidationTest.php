<?php

/**
 * References
 *
 *  - https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md
 *  - http://zackpierce.github.io/xAPI-Validator-JS/
 */

use app\locker\statements\xAPIValidation as xAPIValidation;

abstract class BaseStatementValidationTest extends PHPUnit_Framework_TestCase
{
  protected $json_input;

  protected function getFixturePath()
  {
    return __DIR__ . '/../../../Fixtures/Statements';
  }

  protected function exec($path)
  {
    $json = file_get_contents($path);
    $this->json_input = json_decode($json, true);
    $auth = isset($this->json_input['authority']) ? $this->json_input['authority'] : [
      'name' => "John Smith",
      'mbox' => "mailto:test@learninglocker.co.uk",
      'objectType' => "Agent"
    ];
    $manager = new xAPIValidation();
    return $manager->runValidation($this->json_input, $auth);
  }

}
