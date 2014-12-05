<?php

class StatementVersionTest extends TestCase
{

    public function setUp()
    {
        parent::setUp();

        Route::enableFilters();

        // Authentication as super user.
        $user = User::firstOrCreate(['email' => 'andy@ll.com']);
        Auth::login($user);

        $this->lrs = $this->createLRS();
    }

    /**
     * If no 'version' provided in statement, LRS must save '1.0.0' as default
     * as value.
     */
    public function testMissingVersion()
    {
        $statement = $this->defaultStatment();

        // make sure there is no version
        $this->assertTrue(!isset($statement['version']), 'There is no version provided');

        $return = $this->createStatement($statement, $this->lrs);

        $id = reset($return['ids']);

        /* @var $saved_statement Statement */
        $saved_statement = App::make('Locker\Repository\Statement\EloquentStatementRepository')->show($id);
        $this->assertTrue(isset($saved_statement->statement['version']), 'There is no version provided');
        $this->assertEquals('1.0.0', $saved_statement->statement['version']);
    }

}
