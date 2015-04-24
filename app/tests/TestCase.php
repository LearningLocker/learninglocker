<?php namespace Tests;
use \Illuminate\Foundation\Testing\TestCase as IlluminateTest;

abstract class TestCase extends IlluminateTest {

  /**
   * Creates the application.
   * @return \Symfony\Component\HttpKernel\HttpKernelInterface
   */
  public function createApplication() {
    $unitTesting = true;
    $testEnvironment = 'testing';
    return require __DIR__ . '/../../bootstrap/start.php';
  }

}
