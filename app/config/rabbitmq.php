<?php

return [
  'enabled' => false,
  'host'=> 'localhost',
  'port'=> 5672,
  'username'=> 'guest',
  'password'=> 'guest',
  'exchange'=> 'learninglocker',
  'ssl'=> [
    'enabled'=> false,
    'capath'=> '/etc/ssl/cert',
    'cafile'=> './somecert.pem',
    'verify_peer'=> true
  ]
];