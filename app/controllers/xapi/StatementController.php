<?php namespace Controllers\xAPI;

use \Locker\Repository\Statement\StatementRepository as Statement;

class StatementsController extends BaseController {

	/**
	* Statement Repository
	*/
	protected $statement;

	/**
	 * Current LRS based on Auth credentials
	 **/
	protected $lrs;

	/**
	 * Filter parameters
	 **/
	protected $params;


	/**
	 * Construct
	 *
	 * @param StatementRepository $statement
	 */
	public function __construct(Statement $statement){

		$this->statement = $statement;
		$this->beforeFilter('@checkVersion', array('only' => 'store'));
		$this->beforeFilter('@getLrs');
		$this->beforeFilter('@setParameters', array('except' => 'store'));

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

		// Save the statement
		$save = $this->statement->create( $statement, $this->lrs );

		if( $save['success'] ){
			return $this->returnSuccessError( true, $save['id'], '200' );
		}else{
			return $this->returnSuccessError( false, implode($save['message']), '400' );
		}

	}

	/**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
	public function update(){}

	/**
     * Display a listing of the resource.
     *
     * @return Response
     */
	public function index(){

		$statements = $this->statement->all( $this->lrs->_id, $this->params );
		return $this->returnArray( $statements->toArray(), $this->params );

	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return View
	 */
	public function show( $id ){

		$statement = $this->statement->find($id);
		
		if( $this->checkAccess( $statement ) ){
        	return $this->returnArray( $statement->toArray() );
        }else{
        	return $this->returnSuccessError( false, 'You are not authorized to access this statement.', 403 );
        }
		
	}

	/**
	 * Check request header for correct xAPI version
	 **/
	public function checkVersion( $route, $request ){

		//should be X-Experience-API-Version: 1.0.0 or 1.0.1 (can accept 1.0), reject everything else.
		$version = \Request::header('X-Experience-API-Version');

		if( !isset($version) || ( $version < '1.0.0' || $version > '1.0.9' ) && $version != '1.0' ){
			return $this->returnSuccessError( true, 'This is not an accepted version of xAPI.', '400' );
		}

	}

	/**
	 * Get the LRS details based on Auth credentials
	 *
	 **/
	public function getLrs(){
		//get the lrs
		$key  	= \Request::getUser();
		$secret = \Request::getPassword();
		$lrs 	= \Lrs::where('api.basic_key', $key)
				   ->where('api.basic_secret', $secret)
				   ->first();
		$this->lrs = $lrs;
	}

	/**
	 * This is used when retriving statements. Make sure any 
	 * statements requested are in the LRS relating to the 
	 * credentials used to authenticate.
	 *
	 * @param object Statement
	 * @return boolean
	 **/
	public function checkAccess( $statement ){

		$statement_lrs = $statement['context']['extensions']['http://learninglocker&46;net/extensions/lrs']['_id'];

		if( $statement_lrs == $this->lrs->_id ){
			return true;
		}

		return false;

	}

	public function setParameters(){

		$this->params = \Request::all();

	}

}