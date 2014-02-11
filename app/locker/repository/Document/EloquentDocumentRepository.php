<?php namespace Locker\Repository\Document;

use DocumentAPI;

class EloquentDocumentRepository implements DocumentRepository {

	/**
	* DocumentAPI
	*/
	protected $documentapi;

	/**
	 * Construct
	 *
	 * @param Statement $statement
	 */
	public function __construct( DocumentAPI $documentapi ){

		$this->documentapi = $documentapi;

	}

	public function all( $lrs, $activityId, $actor ){
		return $this->documentapi->where('lrs', $lrs)
								 ->where('activityId', $activityId)
								 ->where('actor', json_decode($actor))
								 ->select('stateId')
								 ->get();
	}

	public function find( $lrs, $stateId ){
		return $this->documentapi->where('lrs', $lrs)
								 ->where('contents.stateId', $stateId)
								 ->first();
	}

	public function store( $lrs, $data, $apitype ){

		$new_document = $this->documentapi;
		$new_document->lrs      = $lrs; //LL specific 
		$new_document->apitype  = $apitype; //LL specific

		switch( $new_document->apitype ){
			case DocumentType::STATE:
				$new_document->activityId   = $data['activityId'];
				$new_document->actor        = json_decode($data['actor']);
				$new_document->stateId      = $data['stateId'];
				$new_document->registration = isset($data['registration']) ? $data['registration'] : null;
			break;
			case DocumentType::ACTIVITY:
				$new_document->activityId = $data['activityId'];
				$new_document->profileId  = $data['profileId'];
			break;
			case DocumentType::AGENT:

			break;
		}


		//@todo add update as per spec https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#miscdocument
		if( is_object( json_decode($data['content'] ) ) ){
			$new_document->content = json_decode($data['content']);
		} else {
			$new_document->content = "..path/to/file/to.do";
		}
		

		if( $new_document->save() ){
			return true;
		}

		return false;

	}

}