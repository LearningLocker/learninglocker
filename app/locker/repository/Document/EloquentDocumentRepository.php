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


	public function all( $lrs, $documentType, $activityId, $actor ){
		$query = $this->documentapi->where('lrs', $lrs)
                 ->where('documentType', $documentType)
								 ->where('activityId', $activityId);

    
    //Do some checking on what actor field we are filtering with
    if( isset($actor->mbox) ){ //check for mbox
      $actor_query = array('field' => 'actor.mbox', 'value'=>$actor->mbox);
    } else if( isset($actor->mbox_sha1sum) ) {//check for mbox_sha1sum
      $actor_query = array('field' => 'actor.mbox_sha1sum', 'value'=>$actor->mbox_sha1sum);
    } else if( isset($actor->openid) ){ //check for open id
      $actor_query = array('field' => 'actor.openid', 'value'=>$actor->openid);
    }

    if( isset($actor_query) ){ //if we have actor query params lined up...
      $query = $query->where( $actor_query['field'], $actor_query['value'] );

    } else if( isset($actor->account) ){ //else if there is an account
      if( isset($actor->account->homePage) && isset($actor->account->name ) ){
        $query = $query->where('actor.account.homePage', $actor->account->homePage)
                       ->where('actor.account.name', $actor->account->name );
      } else {
        \App::abort(400, 'Missing required paramaters in the actor.account');  
      }

    } else {
      \App::abort(400, 'Missing required paramaters in the actor');
    }

    return $query->select('stateId')->get();
	}

	public function find( $lrs, $stateId ){
		return $this->documentapi->where('lrs', $lrs)
								 ->where('contents.stateId', $stateId)
								 ->first();
	}

	public function store( $lrs, $data, $documentType ){

		$new_document = $this->documentapi;
		$new_document->lrs      = $lrs; //LL specific 
		$new_document->documentType  = $documentType; //LL specific

		switch( $new_document->documentType ){
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