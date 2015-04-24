<?php namespace Tests\Repos\Statement;

use \Illuminate\Foundation\Testing\TestCase as Base;

abstract class OptionsTest extends Base {
  protected $default_opts = [];
  protected $overwrite_opts = [];
  protected $valid_opts = [];
  protected $invalid_opts = [];
  protected $options_class = '';

  public function createApplication() {
    $unitTesting = true;
    $testEnvironment = 'testing';
    return require __DIR__ . '/../../../../bootstrap/start.php';
  }

  public function testValidOptions() {
    try {
      $start_opts = $this->valid_opts;
      $end_opts = new $this->options_class($start_opts);

      foreach ($end_opts->options as $key => $val) {
        $this->assertEquals($start_opts[$key], $val);
      }
    } catch (\Exception $ex) {
      \Log::error($ex);
      $this->assertEquals(false, true, $ex->getMessage());
    }
  }

  public function testDefaultOptions() {
    try {
      $start_opts = $this->default_opts;
      $end_opts = new $this->options_class($this->overwrite_opts);

      foreach ($end_opts->options as $key => $val) {
        $this->assertEquals($start_opts[$key], $val);
      }
    } catch (\Exception $ex) {
      \Log::error($ex);
      $this->assertEquals(false, true, $ex->getMessage());
    }
  }

  public function testInvalidOptions() {
    foreach ($this->invalid_opts as $invalid_key => $invalid_val) {
      try {
        $caught = false;
        $start_opts = $this->valid_opts;
        $start_opts[$invalid_key] = $invalid_val;
        $end_opts = new $this->options_class($start_opts);
      } catch (\Exception $ex) {
        $caught = true;
      }
      $this->assertEquals(true, $caught);
    }
  }

  public function testGetOpts() {
    try {
      $start_opts = $this->valid_opts;
      $end_opts = new $this->options_class($start_opts);

      foreach ($start_opts as $key => $val) {
        $this->assertEquals($val, $end_opts->getOpt($key));
      }
    } catch (\Exception $ex) {
      \Log::error($ex);
      $this->assertEquals(false, true, $ex->getMessage());
    }
  }

}
