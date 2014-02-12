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


	public function all( $lrs, $documentType, $activityId, $agent ){

		$query = $this->documentapi->where('lrs', $lrs)
				 ->where('documentType', $documentType)
				 ->where('activityId', $activityId);

		$query = $this->setAgent( $query, $agent );

		return $query->select('stateId')->get();

	}

	public function find( $lrs, $documentType, $activityId, $actor, $stateId ){

		$query = $this->documentapi->where('lrs', $lrs)
				 ->where('documentType', $documentType)
				 ->where('activityId', $activityId)
				 ->where('stateId', $stateId);

		$query = $this->setAgent( $query, $agent );

		return $query->first();

	}

	public function store( $lrs, $data, $documentType ){

		$new_document = $this->documentapi;
		$new_document->lrs           = $lrs; //LL specific 
		$new_document->documentType  = $documentType; //LL specific

		switch( $new_document->documentType ){
			case DocumentType::STATE:
				$new_document->activityId   = $data['activityId'];
				$new_document->agent        = $data['agent'];
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
		if( is_object( json_decode($data['content'] ) ) ){ //save json as an object

	  		$new_document->contentType = 'application/json';
			$new_document->content = json_decode($data['content']);

		} else if( is_string($data['content']) ){ //save text as raw text

	  		$new_document->contentType = 'text/plain';
			$new_document->content = $data['content'];

		} else {

			//TODO - save file content and reference through file path     
			//Need to actually check this is a binary file still 
			$new_document->contentType = 'file/mimetype'; //use this value to return an actual file when requesting the document - may want to use mimetype here?
			$new_document->content = "..path/to/file/to.do"; 

		}
		
		if( $new_document->save() ){
			return true;
		}

		return false;

	}

	/**
	 * When agent json is passed, get correct identifier
	 *
	 * @param @query  The query in question - called from all and find.
	 * @param @agent  The agent json object
	 *
	 * @return $query
	 * 
	 */
	public function setAgent( $query, $agent ){

		$agent_query = '';

		//Do some checking on what actor field we are filtering with
		if( isset($agent->mbox) ){ //check for mbox

	  		$agent_query = array('field' => 'agent.mbox', 'value'=>$agent->mbox);

		} else if( isset($agent->mbox_sha1sum) ) {//check for mbox_sha1sum

			$agent_query = array('field' => 'agent.mbox_sha1sum', 'value'=>$agent->mbox_sha1sum);

		} else if( isset($agent->openid) ){ //check for open id

			$agent_query = array('field' => 'agent.openid', 'value'=>$agent->openid);

		}

		if( isset($agent_query) ){ //if we have agent query params lined up...

			$query->where( $agent_query['field'], $agent_query['value'] );

		} else if( isset($agent->account) ){ //else if there is an account

			if( isset($agent->account->homePage) && isset($agent->account->name ) ){

				$query->where('agent.account.homePage', $agent->account->homePage)
					   	 ->where('agent.account.name', $agent->account->name );

			} else {

				\App::abort(400, 'Missing required paramaters in the agent.account');

			}

		} else {

			\App::abort(400, 'Missing required paramaters in the agent');

		}

		return $query;
	}

}