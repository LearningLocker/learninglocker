<?php

return [
  'enabled' => false,
  'type' => 'none', // none, rabbitmq
  'rabbitmq' => [
    'host'=> 'localhost',
    'port'=> 5672,
    'username'=> 'guest',
    'password'=> 'guest',
    'vhost'=> '/',
    'exchange'=> 'learninglocker',
    'ssl_enabled'=> true,
    'ssl'=> [
      'cafile'=> '/etc/ssl/cert/somecert.pem',
      'verify_peer'=> true
    ]
  ],
  'model_keys' => ['id', 'lrs_id', 'client_id', 'statement', 'stored']
];