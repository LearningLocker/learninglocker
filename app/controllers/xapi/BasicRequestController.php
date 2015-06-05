<?php namespace Controllers\xAPI;

use Locker\Repository\Client\Repository as Client; 

class BasicRequestController extends BaseController {

  // Defines properties to be set to constructor parameters.
  protected $client;

  // Defines properties to be set by filters.
  protected $params, $lrs;


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
  	$client = $this->client_repo->store([
      'authority' => [
        'name' => 'API Client',
        'mbox' => 'mailto:hello@learninglocker.net'
      ]
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
