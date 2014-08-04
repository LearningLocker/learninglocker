<?php

class TestCase extends Illuminate\Foundation\Testing\TestCase {

    /**
     * Creates the application.
     *
     * @return \Symfony\Component\HttpKernel\HttpKernelInterface
     */
    public function createApplication()
    {
        $unitTesting = true;

        $testEnvironment = 'testing';

        return require __DIR__ . '/../../bootstrap/start.php';
    }

    public function setUp()
    {
        parent::setUp();
        $user = User::firstOrCreate(['email' => 'quan@ll.com']);

        // if first user, create site object
        if (\User::count() == 1) {
            $site = new \Site;
            $site->name = '';
            $site->description = '';
            $site->email = $user->email;
            $site->lang = 'en-US';
            $site->create_lrs = array('super');
            $site->registration = 'Closed';
            $site->restrict = 'None'; // restrict registration to a specific email domain
            $site->domain = '';
            $site->super = array(array('user' => $user->_id));
            $site->save();
        }
    }

}
