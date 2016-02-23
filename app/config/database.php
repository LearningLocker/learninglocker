<?php

return [
  'fetch' => PDO::FETCH_CLASS,
  'default' => 'mongodb',
  'connections' => [
		'mongodb' => [
        'driver'   => 'mongodb',
        'host'     => 'localhost',
        'port'     => 27017,
        'username' => '',
        'password' => '',
        'database' => 'll_staging' // Default name (removing this makes Travis fail).
    ],
	],
	'migrations' => 'migrations',
];
