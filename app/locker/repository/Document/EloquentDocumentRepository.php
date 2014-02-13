<?php namespace Locker\Repository\Document;

use DocumentAPI;
use Carbon\Carbon;

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

  ///////////////////////////////////
  // DOCUMENT TYPE ROUTING METHODS //
  ///////////////////////////////////

  /**
   * Find multiple documents
   * @param  Lrs $lrs
   * @param  String $documentType   The type of document
   * @param  Array $data
   * @return Collection             A collection of DocumentAPIs
   */
  public function all( $lrs, $documentType, $data, $get = true ){

    switch( $documentType ){
      case DocumentType::STATE:
        return $this->allState( $lrs, $data['activityId'], $data['agent'], $data['registration'], $data['since'], $get );
      break;
      case DocumentType::ACTIVITY:
        //return $this->allActivity( $lrs, $data );
      break;
      case DocumentType::AGENT:
        //return $this->allActivity( $lrs, $data );
      break;
    }

  }

  /**
   * Find single document
   * 
   * @param  Lrs $lrs
   * @param  String $documentType   The type of document
   * @param  Array $data
   * 
   * @return DocumentAPI
   */
  public function find( $lrs, $documentType, $data, $get = true ){

    switch( $documentType ){
      case DocumentType::STATE:
        return $this->findState( $lrs, $data['stateId'], $data['activityId'], $data['agent'], $data['registration'], $get );
      break;
      case DocumentType::ACTIVITY:
        //return $this->findActivity( $lrs, $data );
      break;
      case DocumentType::AGENT:
        //return $this->findActivity( $lrs, $data );
      break;
    }

  }


  /**
   * Store document
   * 
   * @param  Lrs $lrs
   * @param  String $documentType   The type of document
   * @param  Array $data
   * @param  String $updated        ISO 8601 Timestamp
   * @param  String $method     HTTP Method used to send store request
   * 
   * @return DocumentAPI  Returns the updated/created document
   */
  public function store( $lrs, $documentType, $data, $updated, $method ){

    switch( $documentType ){
      case DocumentType::STATE:
        return $this->storeState( $lrs, $data, $updated, $method );
      break;
      case DocumentType::ACTIVITY:
        //return $this->storeActivity( $lrs, $data, $updated );
      break;
      case DocumentType::AGENT:
        //return $this->storeActivity( $lrs, $data, $updated );
      break;
    }

  }

  /**
   * Delete document(s)
   * 
   * @param  Lrs $lrs
   * @param  String $documentType   The type of document
   * @param  Array $data
   * 
   * @return DocumentAPI
   */
  public function delete( $lrs, $documentType, $data, $single_document ){

    $data['since'] = null;

    if( $single_document ){
      $result = $this->find( $lrs, $documentType, $data, false );
    } else {
      $result = $this->all( $lrs, $documentType, $data, false );
    }
    
    $result->delete();
    return true;
  }



  ///////////////////
  // STATE METHODS //
  ///////////////////

  /**
   * Find States
   * 
   * @param  Lrs $lrs          
   * @param  String $activityId      IRI
   * @param  Object $agent        
   * @param  String $registration 
   * @param  Timestamp $since        ISO 8601
   * 
   * @return Collection              A collection of DocumentAPIs
   */
  public function allState( $lrs,  $activityId, $agent, $registration, $since, $get ){

    $query = $this->documentapi->where('lrs', $lrs)
         ->where('documentType', DocumentType::STATE)
         ->where('activityId', $activityId);

    $query = $this->setAgent( $query, $agent );
    $query = $this->setRegistration( $query, $registration );

    if( isset($since) ){
      $query = $this->setSince( $query, $since );
    }

    if( $get ){
      return $query->select('stateId')->get();
    } else {
      return $query->select('stateId');
    }

  }

  /**
   * Find single stateId
   * 
   * @param  Lrs $lrs          
   * @param  string $stateId      
   * @param  String $activityId      IRI
   * @param  Object $agent        
   * @param  String $registration 
   * 
   * @return DocumentAPI
   */
  public function findState( $lrs, $stateId, $activityId, $agent, $registration, $get ){

    $query = $this->documentapi->where('lrs', $lrs)
         ->where('documentType', DocumentType::STATE)
         ->where('activityId', $activityId)
         ->where('stateId', $stateId);

    $query = $this->setAgent( $query, $agent );
    $query = $this->setRegistration( $query, $registration );

    if( $get ){
      return $query->first();
    } else {
      return $query;
    }

  }


  /**
   * Handle storing State documents
   * 
   * @param  Lrs $lrs
   * @param  Array $data        The required data for the state
   * @param  String $updated    ISO 8601 Timestamp
   * @param  String $method     HTTP Method used to send store request
   * 
   * @return DocumentAPI        The document being created/updated
   */
  public function storeState( $lrs, $data, $updated, $method ){

    $existing_document = $this->findState( $lrs, $data['stateId'], $data['activityId'], $data['agent'], $data['registration'], true );

    if( !$existing_document ){
      $document                 = $this->documentapi;

      //LL vars
      $document->lrs            = $lrs; //LL specific 
      $document->documentType   = DocumentType::STATE; //LL specific

      //AP vars
      $document->stateId        = $data['stateId'];
      $document->activityId     = $data['activityId'];
      $document->agent          = $data['agent'];
      $document->registration   = isset($data['registration']) ? $data['registration'] : null;

    } else {
      $document = $existing_document;
    }

    $document->updated_at = new Carbon($updated);
    $document->setContent( $data['content_info'], $method ); //set the content for the document

    if( $document->save() ){
      return $document;
    }

    return false;
  }


  //////////////////////
  // ACTIVITY METHODS //
  //////////////////////




  ///////////////////
  // AGENT METHODS //
  ///////////////////




  ///////////////////
  // QUERY METHODS //
  ///////////////////


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

  /**
   * Unified method for filtering by registration, if provided
   * 
   * @param Eloquent $query The query being filtered
   * @param string $registration The UUID associated with this state
   * 
   * @return $query
   */
  public function setRegistration( $query, $registration ){

    if( !empty($registration) ){
      $query = $query->where('registration', $registration);
    }

    return $query;

  }

  /**
   * Unified method for filtering by stored date (since), if provided
   * 
   * @param Eloquent $query The query being filtered
   * @param string $since The UUID associated with this state
   * 
   * @return $query
   */
  public function setSince($query, $since ){

    if( !empty($since) ){
      $since_carbon = new Carbon($since);
      $query = $query->where('updated_at', '>', $since_carbon);
    }

    return $query;

  }

}