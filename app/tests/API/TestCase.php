<?php namespace Tests\API;
use \App\Locker\Helpers\Helpers as Helpers;
use \Illuminate\Foundation\Testing\TestCase as Base;
use \User as User;
use \Site as Site;
use \Lrs as Lrs;
use \Auth as Auth;
use \Route as Route;
use \Statement as Statement;

abstract class TestCase extends Base {
  static protected $endpoint = '/api/v1/...';
  static protected $statements = 5;
  protected $user = null;
  protected $lrs = null;

  public function setup() {
    echo "TestCase setup starting\r\n";
    parent::setup();
    echo "TestCase createUser\r\n";
    $this->user = $this->createUser();
    echo "TestCase login\r\n";
    Auth::login($this->user);
    echo "TestCase createLRS\r\n";
    $this->lrs = $this->createLRS();
    echo "TestCase create statements\r\n";
    $this->createStatements();
    echo "TestCase setup ending\r\n";
  }

  public function createApplication() {
    $unitTesting = true;
    $testEnvironment = 'testing';
    return require __DIR__ . '/../../../bootstrap/start.php';
  }

  protected function createUser() {
    echo "TestCase starting createUser\r\n";
    $user = User::firstOrCreate(['email' => 'test@example.com']);

    // If first user, create site object
    if (User::count() === 1) {
      echo "TestCase newSite\r\n";
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

    echo "TestCase ending createUser\r\n";
    return $user;
  }

  protected function createLRS() {
    $lrs = new Lrs([
      'title' => 'TestLRS',
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
    for ($i = 0; $i < static::$statements; $i += 1) {
      $response = $this->requestAPI('POST', '/data/xAPI/statements', $statement);
    }
  }

  protected function getHeaders($auth) {
    return [
      'PHP_AUTH_USER' => $auth['basic_key'],
      'PHP_AUTH_PW' => $auth['basic_secret']
    ];
  }

  protected function requestAPI($method = 'GET', $url = '', $content = '') {
    $headers = $this->getHeaders($this->lrs->api);
    Route::enableFilters();
    return $this->call($method, $url, ['X-Experience-API-Version' => '1.0.1'], [], $headers, $content);
  }

  protected function getStatement() {
    return file_get_contents(__DIR__ . '/../Fixtures/statement.json');
  }

  public function tearDown() {
    Statement::where('lrs._id', $this->lrs->_id)->delete();
    $this->lrs->delete();
    $this->user->delete();
    parent::tearDown();
  }
}
