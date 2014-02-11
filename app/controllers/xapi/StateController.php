<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;
use Locker\Repository\Document\DocumentType as DocumentType;

class StateController extends DocumentController {

	/**
	 * Construct
	 *
	 * @param DocumentRepository $document
	 */
	public function __construct(Document $document){

		parent::__construct($document);

		$this->document_type = DocumentType::STATE;

	}


	/**
	 * Return a list of stateId's based on activityId and actor match.
	 *
	 * @todo add in actor details
	 *
	 * @return Response
	 */
	public function index(){
		$data = $this->checkParams(array(
			'activityId' => 'string',
			'actor'      => array('string', 'json'),
		), $this->params );

		$documents = $this->document->all( $this->lrs->_id, $data['activityId'], $data['actor'] );
		return \Response::json( $documents->toArray() );
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store(){

		$state = $this->checkParams( 
			array(
				'activityId' => 'string',
				'actor'      => array('string', 'json'),
				'stateId'    => 'string',
				'content'    => ''
			),
			array(
				'registration' => 'string'
			),
			$this->params
		);


		$store = $this->document->store( $this->lrs->_id, $state, $this->document_type );

		if( $store ){
			return \Response::json( array( 'ok', 204 ) );
		}

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


		

	}

}