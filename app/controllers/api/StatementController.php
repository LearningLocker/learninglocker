<?php namespace Controllers\API;

use \Locker\Repository\Statement\StatementRepository as Statement;

class StatementsController extends BaseController {

	/**
	* Statement Repository
	*/
	protected $statement;


	/**
	 * Use dependancy injection to pass an instance of 
	 * the statement class to this controller.
	 *
	 **/
	public function __construct(Statement $statement){

		$this->statement = $statement;
		$this->beforeFilter('@checkVersion', array('only' => 'store'));

	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store(){

		//grab incoming statement
		$request = \Request::instance();
		$incoming_statement = $request->getContent();
	
		//convert to array
		$statement = json_decode($incoming_statement, TRUE);

		//get the lrs
		$key  	= \Request::getUser();
		$secret = \Request::getPassword();
		$lrs 	= \Lrs::where('api.basic_key', $key)
				   ->where('api.basic_secret', $secret)
				   ->first();

		// Save the statement
		$save = $this->statement->create( $statement, $lrs );

		if( $save['success'] ){
			return \Response::json( array( 'success' => true, 
										   'id'      => $save['id'] ), 
										   200 );
		}else{
			return \Response::json( array( 'error'   => true, 
										   'message' => implode($save['message'])), 
										   400);
		}

	}

	public function update(){}

	public function index(){}

	/**
	 * Check request header for correct xAPI version
	 **/
	public function checkVersion( $route, $request ){

		//should be X-Experience-API-Version: 1.0.0 or 1.0.1 (can accept 1.0), reject everything else.
		$version = \Request::header('X-Experience-API-Version');

		if( !isset($version) || ( $version < '1.0.0' || $version > '1.0.9' ) && $version != '1.0' ){
			return \Response::json( array( 'error'   => true, 
										   'message' => 'This statement is not the correct version of xAPI.'), 
										   400);
		}

	}

}