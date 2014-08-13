<?php

use \app\locker\helpers\Helpers as helpers;

class TestCase extends Illuminate\Foundation\Testing\TestCase
{

  /**
   * Creates the application.
   *
   * @return \Symfony\Component\HttpKernel\HttpKernelInterface
   */
  public function createApplication()
  {
    $unitTesting = true;

    $testEnvironment = 'testing';

    return require __DIR__ . '/../../bootstrap/start.php';
  }

  public function setUp()
  {
    parent::setUp();
    $user = User::firstOrCreate(['email' => 'quan@ll.com']);
    //if first user, create site object
    if (\User::count() == 1) {
      $site = new \Site;
      $site->name = '';
      $site->description = '';
      $site->email = $user->email;
      $site->lang = 'en-US';
      $site->create_lrs = array('super');
      $site->registration = 'Closed';
      $site->restrict = 'None'; //restrict registration to a specific email domain
      $site->domain = '';
      $site->super = array(array('user' => $user->_id));
      $site->save();
    }
  }

  /**
   * Create dummy LRS
   * @return \Lrs
   */
  protected function createLRS()
  {
    $lrs = new Lrs;
    $lrs->title = helpers::getRandomValue();
    $lrs->description = helpers::getRandomValue();
    $lrs->subdomain = helpers::getRandomValue();
    $lrs->api = array(
      'basic_key' => helpers::getRandomValue(),
      'basic_secret' => helpers::getRandomValue()
    );

    // $lrs->auth_service = property_exists($this, 'lrsAuthMethod') ? $this->lrsAuthMethod : Lrs::INTERNAL_LRS;
    // $lrs->auth_service_url = property_exists($this, 'auth_service_url') ?
    //     $this->auth_service_url : '';
    // $lrs->token = 'our-token';

    $lrs->owner = array('_id' => Auth::user()->_id);
    $lrs->users = array(
      array('_id' => Auth::user()->_id,
        'email' => Auth::user()->email,
        'name' => Auth::user()->name,
        'role' => 'admin'
      )
    );

    $lrs->save();
    $this->lrs = $lrs;

    // Hack header request
    $_SERVER['SERVER_NAME'] = $this->lrs->title . '.com.vn';
    return $lrs;
  }

  /**
   * Return default statement data.
   */
  protected function defaultStatment()
  {
    $siteAttrs = \Site::first();

    return array(
      'actor' => array(
        'objectType' => 'Agent',
        'mbox' => 'mailto:duy.nguyen@go1.com.au',
        'name' => 'duynguyen'
      ),
      'verb' => array(
        "id" => "http://adlnet.gov/expapi/verbs/experienced",
        "display" => array("und" => "experienced")
      ),
      'context' => array(
        "contextActivities" => array(
          "parent" => array(
            "id" => "http://tincanapi.com/GolfExample_TCAPI",
            "objectType" => "Activity"
          ),
          "grouping" => array(
            "id" => "http://tincanapi.com/GolfExample_TCAPI",
            "objectType" => "Activity"
          )
        )
      ),
      "object" => array(
        "id" => "http://tincanapi.com/GolfExample_TCAPI/Playing/Scoring.html",
        "objectType" => "Activity",
        "definition" => array(
          "name" => array(
            "en-US" => "Scoring"
          ),
          "description" => array(
            "en-US" => "An overview of how to score a round of golf."
          )
        )
      ),
      "authority" => array(
        "name" => $siteAttrs->name,
        "mbox" => "mailto:" . $siteAttrs->email,
        "objectType" => "Agent"
      ),
    );
  }

  /**
   * Create dummy statement with lrs.
   *
   * @param Lrs $lrs
   * @return type
   */
  protected function createStatement($statement, $lrs)
  {
    return App::make('Locker\Repository\Statement\EloquentStatementRepository')
      ->create([$statement], $lrs);
  }

  /**
   * Create dummy Auth Client
   * @param type $lrs
   * @return type
   */
  protected function createClientAuth($auth)
  {
    return [
      'name' => helpers::getRandomValue(),
      'api_key' => $auth['api_key'],
      'api_secret' => $auth['api_secret'],
    ];
  }

  protected function dummyEmail()
  {
    return helpers::getRandomValue() . '@go1.com.au';
  }

  protected function makeRequestHeaders($auth, $version="1.0.1")
  {
    return [
      'PHP_AUTH_USER' => $auth['api_key'],
      'PHP_AUTH_PW' => $auth['api_secret'],
      'HTTP_X-Experience-API-Version' => $version
    ];
  }

}
