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

use \Locker\Helpers\Helpers as Helpers;

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


$env = $app->detectEnvironment(function () use ($app) {
  // Attempts to set the environment using the hostname (env => hostname).
  $env = Helpers::getEnvironment([
    'local' => [gethostname()] // Change this if you don't want to use the local config.
  ], gethostname());
  if ($env) return $env;

  // Attempts to set the environment using the domain (env => domain).
  $env = Helpers::getEnvironment([
    'local' => ['127.0.0.1', 'localhost']
    // 'production' => ['*.example.com']
  ], $app['request']->getHost());
  if ($env) return $env;

  // Sets environment using LARAVEL_ENV server variable if it's set.
  if (array_key_exists('LARAVEL_ENV', $_SERVER)) {
    return $_SERVER['LARAVEL_ENV'];
  }

  // Otherwise sets the environment to production or the test environment if unit testing.
  return 'production';
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
