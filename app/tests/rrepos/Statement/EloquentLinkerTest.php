<?php namespace Tests\Repos\Statement;

use \Locker\Repository\Statement\EloquentLinker as Linker;
use \Locker\Repository\Statement\StorerOptions as StorerOptions;

class EloquentLinkerTest extends EloquentTest {

  public function setup() {
    parent::setup();
    $this->linker = new Linker();
  }

  public function test() {
    return null;
  }
}
