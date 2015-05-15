<?php

/*
|--------------------------------------------------------------------------
| Learning Locker event listeners
|--------------------------------------------------------------------------
|
| Below you will find some default event listeners for Learning Locker.
|
*/

Event::listen('user.login', 'app\locker\listeners\LoginHandler');

Event::listen('user.domain_check', 'app\locker\listeners\RegisterHandler@domain_check');

Event::listen('user.register', 'app\locker\listeners\RegisterHandler');

Event::listen('user.email_resend', 'app\locker\listeners\RegisterHandler@resentEmailVerification');

// Adds a Client for the LRS when the LRS is created.
Event::listen('Lrs.store', function ($opts) {
  $repo = new Locker\Repository\Client\EloquentRepository();
  $repo->store([], ['lrs_id' => $opts['model']->_id]);
});

// Removes Clients for the LRS when the LRS is destroyed.
Event::listen('Lrs.destroy', function ($opts) {
  $repo = new Locker\Repository\Client\EloquentRepository();
  $clients = $repo->index(['lrs_id' => $opts['id']]);
  foreach ($clients as $client) {
    $repo->destroy($client->_id, ['lrs_id' => $opts['id']]);
  }
});
