<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;

class ActivityController extends BaseController {

	/**
	* Document Repository
	*/
	protected $document, $type;

	/**
	 * Construct
	 *
	 * @param DocumentRepository $document
	 */
	public function __construct(Document $document){

		$this->document = $document;
		$this->beforeFilter('@getLrs');

		$this->document_type = DocumentType::STATE;

	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		//
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
		$profile = json_decode($incoming_data, TRUE);

		//validate
		if( $this->validate( $profile ) && $this->validateActivity( $profile['contents'] ) ){

			$store = $this->document->store( $this->lrs->_id, $profile['id'], $profile['contents'], $this->document_type );

			if( $store ){
				return \Response::json( array( 'ok', 204 ) );
			}

		}

		return \Response::json( array( 'error', 400 ) );

	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show( $activityId ){

		$document = $this->document->find( $this->lrs->_id, $activityId );

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
	 * 
	 * @param $data Array Data Specific Activity data to store.
	 *
	 **/
	public function validateActivity( $data ){

		//now check required keys exist
		if( !array_key_exists('activityId', $data) 
			|| !array_key_exists('profileId', $data) ){
			return false;
		}

		//check activityId is string
		if( !is_string( $data['activityId'] ) ){
			return false;
		}

		//check profileId is string
		if( !is_string( $data['profileId'] ) ){
			return false;
		}

		return true;

	}


}