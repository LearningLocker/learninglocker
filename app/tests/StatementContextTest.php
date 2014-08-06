<?php

class StatementContextTest extends TestCase
{

    public function setUp()
    {
        parent::setUp();
        // Authentication as super user.
        $user = User::firstOrCreate(array('email' => $this->dummyEmail()));
        Auth::login($user);
        $this->lrs = $this->createLRS();
        $this->statement = App::make('Locker\Repository\Statement\EloquentStatementRepository');
    }

    /**
     * The LRS MUST return single Activity Objects as an array of length one
     * containing the same Activity.
     */
    public function testContextActivities()
    {
        $stmt = $this->defaultStatment();
        // $parent = new stdClass();
        // $parent->id = 'http://tincanapi.com/GolfExample_TCAPI';
        // $parent->objectType = 'Activity';
        $parent = [
            'id' => 'http://tincanapi.com/GolfExample_TCAPI',
            'objectType' => 'Activity'
        ];
        $contextActivities = ['parent' => $parent]; // $parent should be an array not an object.
        $stmt['context']['contextActivities'] = $contextActivities;

        $return = $this->createStatement($stmt, $this->lrs);

        $id = $return['ids'][0];
        $saved_statement = $this->statement->find($id);
        // The parent must be array.
        $this->assertTrue(is_array($saved_statement['statement']['context']['contextActivities']['parent']));
    }

}
