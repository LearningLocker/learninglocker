<?php

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| The first thing we will do is create a new Laravel application instance
| which serves as the "glue" for all the components of Laravel, and is
| the IoC container for the system binding all of the various parts.
|
*/

$app = new Illuminate\Foundation\Application;

/*
|--------------------------------------------------------------------------
| Detect The Application Environment
|--------------------------------------------------------------------------
|
| Laravel takes a dead simple approach to your application environments
| so you can just specify a machine name for the host that matches a
| given environment, then we will automatically detect it for you.
|
*/


$env = $app->detectEnvironment( function() {
  // local development environments are set with machine host names
  $environments = array(
  'local'       => array('your-machine-name'),
  'ht2'         => array('HT2-007')
);

  // loop through environments and check for local development hostnames
  foreach( $environments as $environment => $hosts ) {
    foreach( (array) $hosts as $host ) {
      $isThisMachine = str_is($host, gethostname());
      if ($isThisMachine) return $environment;
    }
  }

  $hosts = array(
    '127.0.0.1'                   => 'local',
    'staging.learninglocker.net'  => 'staging'
  );

  if( isset($_SERVER['SERVER_NAME']) ){
    if( isset( $hosts[$_SERVER['SERVER_NAME']]) ) {
      return $hosts[$_SERVER['SERVER_NAME']];
    }
  }

  // if no local hostname is found, look for
  // other environments are set using the LARAVEL_ENV server variable
  if( array_key_exists('LARAVEL_ENV', $_SERVER) ) {
    return $_SERVER['LARAVEL_ENV'];
  } else { // and we fall back to production
    return 'production';
  }
});

/*
|--------------------------------------------------------------------------
| Bind Paths
|--------------------------------------------------------------------------
|
| Here we are binding the paths configured in paths.php to the app. You
| should not be changing these here. If you need to change these you
| may do so within the paths.php file and they will be bound here.
|
*/

$app->bindInstallPaths(require __DIR__.'/paths.php');

/*
|--------------------------------------------------------------------------
| Load The Application
|--------------------------------------------------------------------------
|
| Here we will load this Illuminate application. We will keep this in a
| separate location so we can isolate the creation of an application
| from the actual running of the application with a given request.
|
*/

$framework = $app['path.base'].'/vendor/laravel/framework/src';

require $framework.'/Illuminate/Foundation/start.php';

/*
|--------------------------------------------------------------------------
| Return The Application
|--------------------------------------------------------------------------
|
| This script returns the application instance. The instance is given to
| the calling script so we can separate the building of the instances
| from the actual running of the application and sending responses.
|
*/

return $app;
