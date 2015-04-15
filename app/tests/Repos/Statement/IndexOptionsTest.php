<?php namespace Tests\Repos;

use \Illuminate\Foundation\Testing\TestCase as Base;
use \Locker\Repository\Statement\IndexOptions as IndexOptions;

class IndexOptionsTest extends Base {

  public function setup() {
    parent::setup();
    $this->default_opts = [
      'agent' => null,
      'activity' => null,
      'verb' => null,
      'registration' => null,
      'since' => null,
      'until' => null,
      'active' => true,
      'voided' => false,
      'related_activities' => false,
      'related_agents' => false,
      'ascending' => false,
      'format' => 'exact',
      'offset' => 0,
      'limit' => 100,
      'langs' => [],
      'attachments' => false,
      'lrs_id' => '1'
    ];
    $this->test_opts = [
      'agent' => (object) ['mbox' => 'mailto:test@example.com'],
      'activity' => 'http://www.example.com',
      'verb' => 'http://www.example.com',
      'registration' => '93439880-e35a-11e4-b571-0800200c9a66',
      'since' => '2015-01-01T00:00Z',
      'until' => '2015-01-01T00:00Z',
      'active' => true,
      'voided' => true,
      'related_activities' => true,
      'related_agents' => true,
      'ascending' => true,
      'format' => 'exact',
      'offset' => 0,
      'limit' => 1,
      'langs' => [],
      'attachments' => true,
      'lrs_id' => '1'
    ];
    $this->invalid_opts = [
      'agent' => (object) ['mbox' => 'test@example.com'],
      'activity' => 'zz.example.com',
      'verb' => 'zz.example.com',
      'registration' => '93439880-e35a-11e4-b571-0800200c9a66Z',
      'since' => '2015-01-01T00:00ZYX',
      'until' => '2015-01-01T00:00ZYX',
      'active' => 'invalid',
      'voided' => 'invalid',
      'related_activities' => 'invalid',
      'related_agents' => 'invalid',
      'ascending' => 'invalid',
      'format' => 'invalid',
      'offset' => -1,
      'limit' => -1,
      'langs' => 'invalid',
      'attachments' => 'invalid',
      'lrs_id' => null
    ];
  }

  public function createApplication() {
    $unitTesting = true;
    $testEnvironment = 'testing';
    return require __DIR__ . '/../../../../bootstrap/start.php';
  }

  public function testValidOptions() {
    try {
      $start_opts = $this->test_opts;
      $end_opts = new IndexOptions($start_opts);

      foreach ($end_opts->options as $key => $val) {
        $this->assertEquals($start_opts[$key], $val);
      }
    } catch (\Exception $ex) {
      $this->assertEquals(false, true, $ex->getMessage());
    }
  }

  public function testValidCanonicalFormat() {
    try {
      $start_opts = $this->test_opts;
      $start_opts['format'] = 'canonical';
      $end_opts = new IndexOptions($start_opts);

      foreach ($end_opts->options as $key => $val) {
        $this->assertEquals($start_opts[$key], $val);
      }
    } catch (\Exception $ex) {
      $this->assertEquals(false, true, $ex->getMessage());
    }
  }

  public function testValidIdsFormat() {
    try {
      $start_opts = $this->test_opts;
      $start_opts['format'] = 'ids';
      $end_opts = new IndexOptions($start_opts);

      foreach ($end_opts->options as $key => $val) {
        $this->assertEquals($start_opts[$key], $val);
      }
    } catch (\Exception $ex) {
      $this->assertEquals(false, true, $ex->getMessage());
    }
  }

  public function testDefaultOptions() {
    try {
      $start_opts = $this->default_opts;
      $end_opts = new IndexOptions(['lrs_id' => $this->default_opts['lrs_id']]);

      foreach ($end_opts->options as $key => $val) {
        $this->assertEquals($start_opts[$key], $val);
      }
    } catch (\Exception $ex) {
      $this->assertEquals(false, true, $ex->getMessage());
    }
  }

  public function testInvalidOptions() {
    foreach ($this->invalid_opts as $invalid_key => $invalid_val) {
      try {
        $caught = false;
        $start_opts = $this->test_opts;
        $start_opts[$invalid_key] = $invalid_val;
        $end_opts = new IndexOptions($start_opts);
      } catch (\Exception $ex) {
        $caught = true;
      }
      $this->assertEquals(true, $caught);
    }
  }

  public function testGetOpts() {
    try {
      $start_opts = $this->test_opts;
      $end_opts = new IndexOptions($start_opts);

      foreach ($start_opts as $key => $val) {
        $this->assertEquals($val, $end_opts->getOpt($key));
      }
    } catch (\Exception $ex) {
      $this->assertEquals(false, true, $ex->getMessage());
    }
  }

}
