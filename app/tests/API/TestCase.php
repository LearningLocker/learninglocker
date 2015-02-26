<?php namespace Tests\API;
use \App\Locker\Helpers\Helpers as Helpers;
use \Illuminate\Foundation\Testing\TestCase as Base;
use \User as User;
use \Site as Site;
use \Lrs as Lrs;
use \Auth as Auth;
use \Route as Route;

abstract class TestCase extends Base {
  static protected $endpoint = '/api/v1/...';
  static protected $statements = 5;
  protected $user = null;
  protected $lrs = null;

  public function __construct() {
    parent::__construct();
    $this->user = $this->createUser();
    $this->lrs = $this->createLRS();
    $this->createStatements(); // Should this be in setup?
  }

  public function createApplication() {
    $unitTesting = true;
    $testEnvironment = 'testing';
    return require __DIR__ . '/../../../bootstrap/start.php';
  }

  protected function createUser() {
    $user = User::firstOrCreate(['email' => 'test@example.com']);

    // If first user, create site object
    if (User::count() === 1) {
      $site = new Site([
        'name' => 'Test Site',
        'email' => $user->email,
        'lang' => 'en-US',
        'create_lrs' => ['super'],
        'registration' => 'Closed',
        'restrict' => 'None',
        'domain' => '',
        'super' => [['user' => $user->_id]],
      ]);
      $site->save();
    }

    return $user;
  }

  protected function createLRS() {
    $lrs = new Lrs([
      'title' => 'Test LRS',
      'api' => [
        'basic_key' => Helpers::getRandomValue(),
        'basic_secret' => Helpers::getRandomValue()
      ],
      'owner' => [
        '_id' => Auth::user()->_id,
      ],
      'users' => [[
        '_id' => Auth::user()->_id,
        'email' => Auth::user()->email,
        'name' => Auth::user()->name,
        'role' => 'admin'
      ]],
      'domain' => '',
    ]);

    $lrs->save();

    // Hack header request
    $_SERVER['SERVER_NAME'] = $lrs->title . '.com.vn';
    return $lrs;
  }

  protected function createStatements() {
    $statement = $this->getStatement();
    for ($i = 0; i < static::$statements; $i += 1) {
      $this->requestAPI('POST', 'data/xapi/statements', $statement);
    }
  }

  protected function getHeaders($auth) {
    return [
      'PHP_AUTH_USER' => $auth['basic_key'],
      'PHP_AUTH_PW' => $auth['basic_secret']
    ];
  }

  protected function requestAPI($method = 'GET', $url = '', $content = '') {
    $url = static::$endpoint . ($url === '' ? '' : '/') . $url;
    $headers = $this->getHeaders($this->lrs->api);
    Route::enableFilters();
    return $this->call($method, $url, [], [], $headers, $content);
  }

  protected function getStatement() {
    return file_get_contents('../Fixtures/statement.json');
  }

}
