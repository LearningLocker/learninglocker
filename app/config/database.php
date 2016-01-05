<?php

return [
  'fetch' => PDO::FETCH_CLASS,
  'default' => 'mongodb',
  'connections' => [
		'mongodb' => [
		    'driver'   => 'mongodb',
		    'host'     => '192.168.99.100',
		    'port'     => 27017,
		    'username' => '',
		    'password' => '',
		    'database' => 'xerox_ll' // Default name (removing this makes Travis fail).
		],
	],
	'migrations' => 'migrations',
];
