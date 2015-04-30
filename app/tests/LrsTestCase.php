<?php namespace Tests;
use \Locker\Helpers\Helpers as Helpers;

abstract class LrsTestCase extends InstanceTestCase {
  protected $lrs;

  public function setUp() {
    parent::setUp();
    $this->lrs = $this->createLrs($this->user);
    $_SERVER['SERVER_NAME'] = $this->lrs->title.'.com.vn';
  }

  protected function createLrs(\User $user) {
    $model = new \Lrs([
      'title' => Helpers::getRandomValue(),
      'description' => Helpers::getRandomValue(),
      'subdomain' => Helpers::getRandomValue(),
      'api' => [
        'basic_key' => helpers::getRandomValue(),
        'basic_secret' => helpers::getRandomValue()
      ],
      'owner' => ['_id' => $user->_id],
      'users' => Helpers::getRandomValue(),
      'users' => [[
        '_id' => $user->_id,
        'email' => $user->email,
        'name' => $user->name,
        'role' => 'admin'
      ]]
    ]);
    $model->save();
    return $model;
  }

  public function tearDown() {
    $this->lrs->delete();
    parent::tearDown();
  }
}
