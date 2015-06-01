<?php namespace Tests;
use \Locker\Helpers\Helpers as Helpers;

abstract class LrsTestCase extends InstanceTestCase {
  protected $lrs, $ll_client;

  public function setUp() {
    parent::setUp();
    $this->lrs = $this->createLrs($this->user);
    $this->ll_client = $this->createLLClient($this->lrs);
    $_SERVER['SERVER_NAME'] = $this->lrs->title.'.com.vn';
  }

  protected function createLrs(\User $user) {
    $model = new \Lrs([
      'title' => 'Test',
      'owner' => ['_id' => $user->_id],
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

  private function createRandomString() {
    return sha1(uniqid(mt_rand(), true));
  }

  protected function createLLClient(\Lrs $lrs) {
    $model = new \Client([
      'api' => [
        'basic_key' => $this->createRandomString(),
        'basic_secret' => $this->createRandomString()
      ],
      'authority' => [
        'name' => 'Test client',
        'mbox' => 'mailto:test@example.com'
      ],
      'lrs_id' => $lrs->_id,
      'scopes' => ['all']
    ]);
    $model->save();
    return $model;
  }

  public function tearDown() {
    $this->ll_client->delete();
    $this->lrs->delete();
    parent::tearDown();
  }
}
