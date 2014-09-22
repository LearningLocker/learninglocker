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

Event::listen('user.create_lrs', 'app\locker\listeners\LrsHandler');

Event::listen('user.create_client', 'app\locker\listeners\ClientHandler');