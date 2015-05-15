<?php namespace Tests;

abstract class InstanceTestCase extends TestCase {
  protected $user, $site;

  public function setUp() {
    parent::setUp();
    $this->user = $this->createUser();
    $this->site = $this->createSite($this->user);
  }

  protected function createSite(\User $user) {
    $model = new \Site([
      'name' => 'Test',
      'description' => '',
      'email' => $user->email,
      'lang' => 'en-US',
      'create_lrs' => 'super',
      'registration' => 'Closed',
      'restrict' => 'None',
      'domain' => '',
      'super' => [['user' => $user->_id]]
    ]);
    $success = $model->save();
    return $model;
  }

  protected function createUser() {
    $model = new \User([
      'email' => 'test@example.com'
    ]);
    $model->save();
    return $model;
  }

  public function tearDown() {
    $this->site->delete();
    $this->user->delete();
    parent::tearDown();
  }
}
