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

	public function all( $lrs, $activityId ){
		return $this->documentapi->where('lrs', $lrs)
								 ->where('contents.activityId', $activityId)
								 ->select('contents.stateId')
								 ->get();
	}

	public function find( $lrs, $stateId ){
		return $this->documentapi->where('lrs', $lrs)
								 ->where('contents.stateId', $stateId)
								 ->first();
	}

	public function store( $lrs, $id, $contents, $apitype ){

		$new_document = $this->documentapi;
		$new_document->lrs      = $lrs; //LL specific 
		$new_document->apitype  = $apitype; //LL specific
		$new_document->id 		= $id;
		//@todo add update as per spec https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#miscdocument
		$new_document->contents = $contents;

		if( $new_document->save() ){
			return true;
		}

		return false;

	}

}