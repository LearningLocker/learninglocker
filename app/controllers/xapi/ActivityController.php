<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;
use \Locker\Repository\Activity\ActivityRepository as Activity;
use Locker\Repository\Document\DocumentType as DocumentType;

class ActivityController extends DocumentController {

  // Defines properties to be set to constructor parameters.
  protected $activity, $document;

  /**
   * Constructs a new ActivityController.
   * @param Document $document
   * @param Activity $activity
   */
  public function __construct(Document $document, Activity $activity){
    parent::__construct($document);

    // Sets constructor params on $this.
    $this->document = $document;
    $this->activity = $activity;

    $this->document_type = DocumentType::ACTIVITY;
    $this->identifier = 'profileId';
  }

  /**
   * Returns a list of stateId's based on activityId and actor match.
   * @return Response
   */
  public function index() {
    // Checks and gets the data from the params.
    $data = $this->checkParams([
      'activityId' => 'string'
    ], [
      'since' => ['string', 'timestamp']
    ], $this->params);

    // Gets all documents.
    $documents = $this->document->all($this->lrs->_id, $this->document_type, $data);
    
    // Returns array of only the stateId values for each document.
    $ids = array_column($documents->toArray(), 'identId');
    return \Response::json($ids);
  }


  /**
   * Returns (GETs) a single document.
   * @return DocumentResponse
   */
  public function get() {
    // Checks and gets the data from the params.
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
  public function store() {
    // Checks and gets the data from the params.
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
   * Deletes a document.
   * @return Response
   */
  public function delete(){
    if (!\LockerRequest::hasParam($this->identifier)) {
      \App::abort(400, 'Multiple document DELETE not permitted');
    }

    // Checks and gets the data from the params.
    $data = $this->checkParams([
      'activityId' => 'string',
      'profileId'    => 'string'
    ], [], $this->params);

    // Attempts to delete the document.
    $success = $this->document->delete(
      $this->lrs->_id,
      $this->document_type,
      $data,
      false
    );
    
    if ($success) {
      return \Response::json(['ok'], 204);
    } else {
      return \Response::json(['error'], 400);
    }
  }

  /**
   * Returns the full activity object.
   * @return Response
   **/
  public function full(){
    $data = $this->checkParams([
        'activityId' => 'string'
    ], [], $this->params);

    return \Response::json(
      $this->activity->getActivity($data['activityId'])
    );
  }


}