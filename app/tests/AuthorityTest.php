<?php

/**
 * Test authority in statment
 *
 * @see https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#authority
 */
class AuthorityTest extends TestCase
{

    public $lrs;
    protected $statement;

    public function setUp()
    {
        parent::setUp();
        // Authentication as super user.
        $user = User::firstOrCreate(array('email' => $this->dummyEmail()));
        Auth::login($user);
        $this->lrs = $this->createLRS();
        $this->statement = App::make('Locker\Repository\Statement\EloquentStatementRepository');
    }

    public function testAuthority()
    {
        $stmt = $this->defaultStatment();

        // Ensure if authority is empty the LRS will be create anonymous authoriry
        $authority = $stmt['authority'];
        unset($stmt['authority']);
        $return = $this->createStatement($stmt, $this->lrs);
        $this->assertEquals($return['success'], true);

        $stmt_id = reset($return['ids']);
        $obj_stmt = $this->statement->find($stmt_id);
        $stmt_authority = $obj_stmt->statement['authority'];
        $this->assertTrue(!empty($stmt_authority));

        // Ensure authority stored in db is same value with statment send to LRS
        $stmt['authority'] = $authority;
        $return = $this->createStatement($stmt, $this->lrs);
        $stmt_id = reset($return['ids']);
        $obj_stmt = $this->statement->find($stmt_id);

        $stmt_authority = $obj_stmt->statement['authority'];
        $this->assertEquals($authority, $stmt_authority);
    }

}
