<?php

class StatementTest extends TestCase {

  public function setUp() {
    parent::setUp();
    // Authentication as super user.
    $user = User::firstOrCreate(array('email' => 'quan@ll.com'));
    Auth::login($user);  
    $this->createLRS();
  }

  /**
   * Create statements for lrs
   *
   * @return void
   */
  public function testCreate() {
    $vs = $this->defaultStatment();
    
    $statement = App::make('Locker\Repository\Statement\EloquentStatementRepository');
    $result = $statement->create([json_decode(json_encode($vs))], $this->lrs);
    
    $this->assertTrue(is_array($result));
  }

}
