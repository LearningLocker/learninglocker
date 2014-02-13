<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;
use Locker\Repository\Document\DocumentType as DocumentType;

class ActivityController extends DocumentController {

  /**
   * Construct
   *
   * @param DocumentRepository $document
   */
  public function __construct(Document $document){

    parent::__construct($document);

    $this->document_type = DocumentType::ACTIVITY;
    $this->document_ident = "profileId";

  }

  /**
   * Handle Single and Multiple GETs and CORS PUT/POST/DELETE requests
   * Return a list of stateId's based on activityId and actor match.
   *
   * @return Response
   */
  public function all(){

    $data = $this->checkParams( 
      array(
        'activityId' => 'string'
      ), 
      array(
        'since'        => array('string', 'timestamp')
      ), $this->params 
    );

    $documents = $this->document->all( $this->lrs->_id, $this->document_type, $data );
    
    //return array of only the stateId values for each document
    $ids = array_column($documents->toArray(), 'profileId');
    return \Response::json( $ids );
  }


  /**
   * Single Document GET
   *
   * @return Response
   */
  public function get(){
    
    $data = $this->checkParams( 
      array(
        'activityId' => 'string',
        'profileId'  => 'string'
      ),
      array(),
      $this->params
    );

    return $this->documentResponse( $data ); // use the DocumentController to handle document response
  }

  /**
   * Handle PUT and POST methods
   *
   * @return Response
   */
  public function store(){

    $data = $this->checkParams( 
      array(
        'activityId' => 'string',
        'profileId'    => 'string'
      ),
      array(), $this->params
    );

    //Get the content from the request
    $data['content_info'] = $this->getAttachedContent('content');

    //Get the updated timestamp
    $updated = $this->getUpdatedValue();

    //Store the document
    $store = $this->document->store( $this->lrs->_id, $this->document_type, $data, $updated, $this->method );

    if( $store ){
      return \Response::json( array( 'ok', 204 ) );
    }

    return \Response::json( array( 'error', 400 ) );

  }

  /**
   * Handles routing to single document delete requests
   * Multiple document deletes are not permitted on activities
   *
   * @param  int  $id
   * @return Response
   */
  public function delete(){

    $single_delete = isset($this->params[$this->document_ident]);

    if( $single_delete ){ //single document delete
      $data = $this->checkParams( 
        array(
          'activityId' => 'string',
          'profileId'    => 'string'
        ),
        array(), $this->params
      );
    } else {
      \App::abort(400, 'Multiple document DELETE not permitted');
    }

    $success = $this->document->delete( $this->lrs->_id, $this->document_type, $data, $single_delete );
    
    if( $success ){
      return \Response::json( array( 'ok', 204 ) );
    }

    return \Response::json( array( 'error', 400 ) );
  }

  /**
   * Return the full activity object
   *
   * @param int $activityId
   * @return Response
   *
   **/
  public function full(){
    $data = $this->checkParams( 
      array(
        'activityId' => 'string'
      ), 
      array(), $this->params 
    );

    // @todo - find complete activity
  }


}