<?php namespace Controllers\xAPI;

use Locker\Repository\Client\ClientRepository as Client; 

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
  public function __construct(Client $client){
  	$this->client  = $client;
    $this->beforeFilter('@getLrs');
    $this->beforeFilter('@setParameters', ['except' => 'store', 'put']);
  }

  /**
   * Create a client and return the credentials.
   * @return Response
   */
  public function store(){
    $content = \LockerRequest::getContent();
	
  	$data = ['lrs_id' => $this->lrs->_id];
  	$client = $this->client->create( $data );

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
