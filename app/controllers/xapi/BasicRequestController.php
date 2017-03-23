<?php namespace Controllers\xAPI;

use Locker\Repository\Client\Repository as Client; 

class BasicRequestController extends BaseController {

  // Defines properties to be set to constructor parameters.
  protected $client;

  // Defines properties to be set by filters.
  protected $params, $lrs;

  // Sets constants for param keys.
  const CLIENT_NAME = 'name';
  const CLIENT_MBOX = 'mbox';
  const CLIENT_SCOPES = 'scopes';

  /**
   * Construct
   *
   *  @param Lrs $lrs
   *  @param Client $client
   */
  public function __construct(Client $client_repo){
    parent::__construct();
    $this->client_repo  = $client_repo;
  }

  /**
   * Create a client and return the credentials.
   * @return Response
   */
  public function store(){
    $opts = ['lrs_id' => $this->lrs->_id];
    $name = \LockerRequest::getParam(self::CLIENT_NAME, 'API Client');
    $mbox = \LockerRequest::getParam(self::CLIENT_MBOX, 'mailto:hello@learninglocker.net');
    $scopes = \LockerRequest::getParam(self::CLIENT_SCOPES, ['all']);

    // Scopes must be an array or they get a 400
    if (!is_array($scopes)) {
      return \Response::json([
        'error' => true,
        'success' => false,
        'message' => 'Scopes must be an array or not defined',
        'code' => 400
      ], 400);
    }

    $client = $this->client_repo->store([
      'authority' => [
        'name' => $name,
        'mbox' => $mbox
      ],
      'scopes' => $scopes
    ], $opts);

    if($client){
      $returnCredentials = array(
        'key' => $client->api['basic_key'],
        'secret' => $client->api['basic_secret']
      );

      return \Response::json($returnCredentials, 200 );
    } else {
      return \Response::json('I\'m a teapot', 418 );
    }
  }
}
