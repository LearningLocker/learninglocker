<?php namespace Controllers\xAPI;

use Locker\Repository\Client\ClientRepository as Client; 

class BasicRequestController extends BaseController {

  /**
   * Lrs
   **/
  protected $lrs;
  
  /**
   * Client
   **/
  protected $client;

  /**
   * Filter parameters
   **/
  protected $params;


  /**
   * Construct
   *
   *  @param Lrs $lrs
   *  @param Client $client
   */
  public function __construct(Client $client){
  	
	$this->client  = $client;

    $this->beforeFilter('@getLrs');
 	$this->beforeFilter('@setParameters', array('except' => 'store', 'put'));


  }

  /**
   * Create a client and return the credentials. Handles POST
   *
   *
   * @return Response
   */
  public function store(){

    //grab incoming statement
    $request = \Request::instance();
    $content = $request->getContent();
	
	$data = array('lrs_id' => $this->lrs->_id);
	
	$client = $this->client->create( $data );

    if($client){
    	$returnCredentials = array(
    		'key' => $client->api['basic_key'],
    		'secret' => $client->api['basic_secret']
		);
		
      return \Response::json($returnCredentials, 200 );
    }else{
      return \Response::json( "I'm a teapot", 418 ); //TODO: think through proper error handling and validation
    }     
      
	  
    //$save = $this->saveStatement( $statements, $attachments );
    //return $this->sendResponse( $save );

  }
  



}
