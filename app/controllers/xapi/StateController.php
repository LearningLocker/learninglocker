<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;

class StateController extends BaseController {

	/**
	* Document Repository
	*/
	protected $document;

	/**
	 * Construct
	 *
	 * @param DocumentRepository $document
	 */
	public function __construct(Document $document){

		$this->document = $document;
		$this->beforeFilter('@getLrs');

	}


	/**
	 * Return a list of stateId's based on activityId and actor match.
	 *
	 * @todo add in actor details
	 *
	 * @return Response
	 */
	public function index(){

		$documents = $this->document->all();

		return \Response::json( $documents->toArray() );

	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store(){

		$request       = \Request::instance();
		$incoming_data = $request->getContent();

		//convert to array
		$state = json_decode($incoming_data, TRUE);

		//validate
		if( $this->validate( $state ) && $this->validateState( $state['contents'] ) ){

			$store = $this->document->store( $this->lrs->_id, $state['id'], $state['contents'], 'state' );

			if( $store ){
				return \Response::json( array( 'ok', 204 ) );
			}

		}

		return \Response::json( array( 'error', 400 ) );

	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $stateId
	 * @return Response
	 */
	public function show( $stateId ){

		$document = $this->document->find( $this->lrs->_id, $stateId );

        return \Response::json( $document->toArray() );

	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		//
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		//
	}

	/**
	 * Simple validation for the specific State API keys
	 *
	 * @param $data Array Data Specific State data to store.
	 *
	 **/
	public function validateState( $data ){

		//now check required keys exist
		if( !array_key_exists('activityId', $data) 
			|| !array_key_exists('actor', $data) 
				|| !array_key_exists('stateId', $data)){
			return false;
		}

		//check activityId is string
		if( !is_string( $data['activityId'] ) ){
			return false;
		}

		//check actor is array
		if( !is_array( $data['actor'] ) ){
			return false;
		}

		//check stateId is string
		if( !is_string( $data['stateId'] ) ){
			return false;
		}

		return true;

	}

}