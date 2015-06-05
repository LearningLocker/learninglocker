<?php namespace Locker\Repository\Document;

use \DocumentAPI;
use \Carbon\Carbon;
use \Locker\Helpers\Exceptions as Exceptions;

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
   * @param  [String => Mixed] $options
   * @param  String $documentType   The type of document
   * @param  Array $data
   * @return Collection             A collection of DocumentAPIs
   */
  public function all( $options, $documentType, $data, $get = true ){

    switch( $documentType ){
      case DocumentType::STATE:
        return $this->allStateDocs( $options, $data['activityId'], $data['agent'], $data['registration'], $data['since'], $get );
      break;
      case DocumentType::ACTIVITY:
        return $this->allActivityDocs( $options, $data['activityId'], $data['since'], $get );
      break;
      case DocumentType::AGENT:
        return $this->allAgentDocs( $options, $data['agent'], $data['since'], $get );
      break;
    }

  }

  /**
   * Find single document
   *
   * @param  [String => Mixed] $options
   * @param  String $documentType   The type of document
   * @param  Array $data
   *
   * @return DocumentAPI
   */
  public function find( $options, $documentType, $data, $get = true ){

    switch( $documentType ){
      case DocumentType::STATE:
        $registration = isset($data['registration']) ? $data['registration'] : null;
        return $this->findStateDoc( $options, $data['stateId'], $data['activityId'], $data['agent'], $registration, $get );
      break;
      case DocumentType::ACTIVITY:
        return $this->findActivityDoc( $options, $data['profileId'], $data['activityId'], $get );
      break;
      case DocumentType::AGENT:
        return $this->findAgentDoc( $options, $data['profileId'], $data['agent'], $get );
      break;
    }

  }


  /**
   * Store document
   *
   * @param  [String => Mixed] $options
   * @param  String $documentType   The type of document
   * @param  Array $data
   * @param  String $updated        ISO 8601 Timestamp
   * @param  String $method     HTTP Method used to send store request
   *
   * @return DocumentAPI  Returns the updated/created document
   */
  public function store( $options, $documentType, $data, $updated, $method ){

    switch( $documentType ){
      case DocumentType::STATE:
        return $this->storeStateDoc( $options, $data, $updated, $method );
      break;
      case DocumentType::ACTIVITY:
        return $this->storeActivityDoc( $options, $data, $updated, $method );
      break;
      case DocumentType::AGENT:
        return $this->storeAgentDoc( $options, $data, $updated, $method );
      break;
    }

  }

  /**
   * Delete document(s)
   *
   * @param  [String => Mixed] $options
   * @param  String $documentType   The type of document
   * @param  Array $data
   *
   * @return DocumentAPI
   */
  public function delete( $options, $documentType, $data, $single_document ){

    $data['since'] = null;

    if( $single_document ){
      $result = $this->find( $options, $documentType, $data, false );
    } else {
      $result = $this->all( $options, $documentType, $data, false );
    }

    //Find all documents in this query that have files and delete them
    $documents = $result->get();

    foreach( $documents as $doc ){
      if( $doc->contentType !== 'application/json' && $doc->contentType !== "text/plain" ){
        $path = $doc->getFilePath();
        if( file_exists($path) ){
          unlink($path); //loop and remove (if file exists)
        }
      }
    }

    $result->delete();
    return true;
  }

  private function filterScopes($options, $scope, $read = true) {
    $scopes = $options['scopes'];

    if (!(in_array('all', $scopes) || ($read && in_array('all/read', $scopes)) || in_array($scope, $scopes))) {
      throw new Exceptions\Exception('Unauthorized request.', 401);
    }
  }



  ///////////////////
  // STATE METHODS //
  ///////////////////

  /**
   * Find States
   *
   * @param  [String => Mixed] $options
   * @param  String $activityId      IRI
   * @param  Object $agent
   * @param  String $registration
   * @param  Timestamp $since        ISO 8601
   * @param  Boolean $get            Used to check if we return a collection or just the eloquent object
   *
   * @return Collection              A collection of DocumentAPIs
   */
  public function allStateDocs( $options,  $activityId, $agent, $registration, $since, $get ){
    $this->filterScopes($options, 'state');

    $query = $this->documentapi->where('lrs', $options['lrs_id'])
         ->where('documentType', DocumentType::STATE)
         ->where('activityId', $activityId);

    $query = $this->setQueryAgent( $query, $agent );
    $query = $this->setQueryRegistration( $query, $registration );

    if( isset($since) ){
      $query = $this->setQuerySince( $query, $since );
    }

    if( $get ){
      return $query->get();
    } else {
      return $query;
    }

  }

  /**
   * Find single stateId
   *
   * @param  [String => Mixed] $options
   * @param  string $stateId
   * @param  String $activityId      IRI
   * @param  Object $agent
   * @param  String $registration
   * @param  Boolean $get            Used to check if we return a collection or just the eloquent object
   *
   * @return DocumentAPI
   */
  public function findStateDoc( $options, $stateId, $activityId, $agent, $registration, $get ){
    $this->filterScopes($options, 'state');

    $query = $this->documentapi->where('lrs', $options['lrs_id'])
         ->where('documentType', DocumentType::STATE)
         ->where('activityId', $activityId)
         ->where('identId', $stateId);

    $query = $this->setQueryAgent( $query, $agent );

    if ( !is_null($registration) ) {
      $query = $this->setQueryRegistration( $query, $registration );
    }

    if( $get ){
      return $query->first();
    } else {
      return $query;
    }

  }


  /**
   * Handle storing State documents
   *
   * @param  [String => Mixed] $options
   * @param  Array $data        The required data for the state
   * @param  String $updated    ISO 8601 Timestamp
   * @param  String $method     HTTP Method used to send store request
   *
   * @return DocumentAPI        The document being created/updated
   */
  public function storeStateDoc( $options, $data, $updated, $method ){
    $this->filterScopes($options, 'state', false);

    $existing_document = $this->findStateDoc( $options, $data['stateId'], $data['activityId'], $data['agent'], $data['registration'], true );

    if ($method === 'PUT' && (
      $data['ifMatch'] !== null ||
      $data['ifNoneMatch'] !== null
    )) $this->checkETag(
      isset($existing_document->sha) ? $existing_document->sha : null,
      $data['ifMatch'],
      $data['ifNoneMatch']
    );

    if( !$existing_document ){
      $document                 = $this->documentapi;

      //LL vars
      $document->lrs            = $options['lrs_id']; //LL specific
      $document->documentType   = DocumentType::STATE; //LL specific

      //AP vars
      $document->identId        = $data['stateId'];
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

  /**
   * Find Activity documents
   *
   * @param  [String => Mixed] $options
   * @param  String $activityId      IRI
   * @param  Timestamp $since        ISO 8601
   * @param  Boolean $get            Used to check if we return a collection or just the eloquent object
   *
   * @return Collection              A collection of DocumentAPIs
   */
  public function allActivityDocs( $options, $activityId, $since, $get ){
    $this->filterScopes($options, 'profile');

    $query = $this->documentapi->where('lrs', $options['lrs_id'])
         ->where('documentType', DocumentType::ACTIVITY)
         ->where('activityId', $activityId);

    if( isset($since) ){
      $query = $this->setQuerySince( $query, $since );
    }

    if( $get ){
      return $query->get();
    } else {
      return $query;
    }

  }

  /**
   * Find single stateId
   *
   * @param  [String => Mixed] $options
   * @param  string $stateId
   * @param  String $activityId      IRI
   * @param  Boolean $get            Used to check if we return a collection or just the eloquent object
   *
   * @return DocumentAPI
   */
  public function findActivityDoc( $options, $profileId, $activityId, $get ){
    $this->filterScopes($options, 'profile');

    $query = $this->documentapi->where('lrs', $options['lrs_id'])
         ->where('documentType', DocumentType::ACTIVITY)
         ->where('activityId', $activityId)
         ->where('identId', $profileId);

    if( $get ){
      return $query->first();
    } else {
      return $query;
    }

  }

  private function checkETag($sha, $ifMatch, $ifNoneMatch) {
    $ifMatch = isset($ifMatch) ? strtoupper($ifMatch) : null;

    if (isset($ifMatch) && $ifMatch !== $sha) {
      throw new Exceptions\FailedPrecondition('Precondition (If-Match) failed.'); // 412.
    } else if (isset($ifNoneMatch) && isset($sha) && $ifNoneMatch === '*') {
      throw new Exceptions\FailedPrecondition('Precondition (If-None-Match) failed.'); // 412.
    } else if ($sha !== null && !isset($ifNoneMatch) && !isset($ifMatch)) {
      throw new Exceptions\Conflict('Check the current state of the resource then set the "If-Match" header with the current ETag to resolve the conflict.'); // 409.
    } else {
      return true;
    }
  }


  /**
   * Handle storing State documents
   *
   * @param  [String => Mixed] $options
   * @param  Array $data        The required data for the state
   * @param  String $updated    ISO 8601 Timestamp
   * @param  String $method     HTTP Method used to send store request
   *
   * @return DocumentAPI        The document being created/updated
   */
  public function storeActivityDoc( $options, $data, $updated, $method ){
    $this->filterScopes($options, 'profile', false);

    $existing_document = $this->findActivityDoc( $options, $data['profileId'], $data['activityId'], true );

    if ($method === 'PUT') $this->checkETag(
      isset($existing_document->sha) ? $existing_document->sha : null,
      $data['ifMatch'],
      $data['ifNoneMatch']
    );

    if( !$existing_document ){
      $document                 = $this->documentapi;

      //LL vars
      $document->lrs            = $options['lrs_id']; //LL specific
      $document->documentType   = DocumentType::ACTIVITY; //LL specific

      //AP vars
      $document->identId      = $data['profileId'];
      $document->activityId     = $data['activityId'];

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



  ///////////////////
  // AGENT METHODS //
  ///////////////////

  /**
   * Find Agent documents
   *
   * @param  [String => Mixed] $options
   * @param  Array $agent
   * @param  Timestamp $since        ISO 8601
   * @param  Boolean $get            Used to check if we return a collection or just the eloquent object
   *
   * @return Collection              A collection of DocumentAPIs
   */
  public function allAgentDocs( $options, $agent, $since, $get ){
    $this->filterScopes($options, 'profile');

    $query = $this->documentapi->where('lrs', $options['lrs_id'])
         ->where('documentType', DocumentType::AGENT);

    $query = $this->setQueryAgent( $query, $agent );

    if( isset($since) ){
      $query = $this->setQuerySince( $query, $since );
    }

    if( $get ){
      return $query->get();
    } else {
      return $query;
    }

  }


  /**
   * Find single profileId
   *
   * @param  [String => Mixed] $options
   * @param  string $stateId
   * @param  Object $agent
   * @param  Boolean $get            Used to check if we return a collection or just the eloquent object
   *
   * @return DocumentAPI
   */
  public function findAgentDoc( $options, $profileId, $agent, $get ){
    $this->filterScopes($options, 'profile');

    $query = $this->documentapi->where('lrs', $options['lrs_id'])
         ->where('documentType', DocumentType::AGENT)
         ->where('identId', $profileId);

    $query = $this->setQueryAgent( $query, $agent );

    if( $get ){
      return $query->first();
    } else {
      return $query;
    }

  }


  /**
   * Handle storing State documents
   *
   * @param  [String => Mixed] $options
   * @param  Array $data        The required data for the state
   * @param  String $updated    ISO 8601 Timestamp
   * @param  String $method     HTTP Method used to send store request
   *
   * @return DocumentAPI        The document being created/updated
   */
  public function storeAgentDoc( $options, $data, $updated, $method ){
    $this->filterScopes($options, 'profile', false);

    $existing_document = $this->findAgentDoc( $options, $data['profileId'], $data['agent'], true );

    if ($method === 'PUT') $this->checkETag(
      isset($existing_document->sha) ? $existing_document->sha : null,
      $data['ifMatch'],
      $data['ifNoneMatch']
    );

    if( !$existing_document ){
      $document                 = $this->documentapi;

      //LL vars
      $document->lrs            = $options['lrs_id']; //LL specific
      $document->documentType   = DocumentType::AGENT; //LL specific

      //AP vars
      $document->identId      = $data['profileId'];
      $document->agent        = $data['agent'];

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
  public function setQueryAgent( $query, $agent ){
    $agent = (object) $agent;

    $agent_query = NULL;

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
      $agent->account = (object) $agent->account;

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
  public function setQueryRegistration( $query, $registration ){

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
  public function setQuerySince($query, $since ){

    if( !empty($since) ){
      $since_carbon = new Carbon($since);
      $query = $query->where('timestamp', '>', $since_carbon);
    }

    return $query;

  }

}
