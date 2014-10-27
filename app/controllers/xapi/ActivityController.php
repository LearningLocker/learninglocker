<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;
use \Locker\Repository\Activity\ActivityRepository as Activity;
use Locker\Repository\Document\DocumentType as DocumentType;

class ActivityController extends DocumentController {

  /**
  * Activity Repository
  */
  protected $activity;

  /**
   * Constructs a new ActivityController.
   * @param Document $document
   * @param Activity $activity
   */
  public function __construct(Document $document, Activity $activity){

    parent::__construct($document);

    $this->activity = $activity;

    $this->document_type = DocumentType::ACTIVITY;
    $this->identifier = 'profileId';

  }

  /**
   * Returns a list of stateId's based on activityId and actor match.
   * @return Response
   */
  public function index(){
    $data = $this->checkParams([
      'activityId' => 'string'
    ], [
      'since' => ['string', 'timestamp']
    ], $this->params);

    $documents = $this->document->all($this->lrs->_id, $this->document_type, $data);
    
    // Returns array of only the stateId values for each document.
    $ids = array_column($documents->toArray(), 'identId');
    return \Response::json($ids);
  }


  /**
   * Returns (GETs) a single document.
   * @return DocumentResponse
   */
  public function get(){
    $data = $this->checkParams([
      'activityId' => 'string',
      'profileId'  => 'string'
    ], [], $this->params);

    return $this->documentResponse($data);
  }

  /**
   * Creates (POSTs) a new document.
   * @return Response
   */
  public function store(){
    $data = $this->checkParams([
      'activityId' => 'string',
      'profileId'    => 'string'
    ], [], $this->params);

    // Gets the content from the request.
    $data['content_info'] = $this->getAttachedContent('content');

    // Gets the updated timestamp.
    $updated = $this->getUpdatedValue();

    // Stores the document.
    $store = $this->document->store(
      $this->lrs->_id,
      $this->document_type,
      $data, $updated,
      $this->method
    );

    if ($store) {
      return \Response::json(['ok'], 204);
    } else {
      return \Response::json(['error'], 400);
    }
  }

  /**
   * Creates (PUTs) a new document.
   * @return Response
   */
  public function update() {
    return store();
  }

  /**
   * Handles routing to single document delete requests
   * Multiple document deletes are not permitted on activities
   *
   * @param  int  $id
   * 
   * @return Response
   */
  public function delete(){
    $single_delete = \LockerRequest::hasParam($this->identifier);

    if ($single_delete) {
      $data = $this->checkParams([
        'activityId' => 'string',
        'profileId'    => 'string'
      ], [], $this->params);
    } else {
      \App::abort(400, 'Multiple document DELETE not permitted');
    }

    $success = $this->document->delete(
      $this->lrs->_id,
      $this->document_type,
      $data,
      $single_delete
    );
    
    if( $success ){
      return \Response::json( array( 'ok' ), 204 );
    }

    return \Response::json( array( 'error' ), 400 );
  }

  /**
   * Return the full activity object
   * 
   * @return Response
   **/
  public function full(){

    $data = $this->checkParams( 
      array(
        'activityId' => 'string'
      ), 
      array(), $this->params 
    );

    $activity = $this->activity->getActivity($data['activityId']);
    return \Response::json($activity);

  }


}