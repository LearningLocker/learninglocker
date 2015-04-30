<?php

return array(
  'connections' => array(
    'mysql' => array(
      'driver'    => 'mysql',
      'host'      => 'localhost',
      'database'  => 'll_staging',
      'username'  => 'root',
      'password'  => 'mysql',
      'charset'   => 'utf8',
      'collation' => 'utf8_unicode_ci',
      'prefix'    => '',
    ),
    'mongodb' => array(
      'driver'   => 'mongodb',
      'host'     => 'localhost',
      'port'     => 27017,
      'username' => '',
      'password' => '',
      'database' => 'll_staging'
    )
  )
);
