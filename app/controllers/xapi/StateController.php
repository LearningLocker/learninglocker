<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;
use Locker\Repository\Document\DocumentType as DocumentType;
use Carbon\Carbon;

class StateController extends DocumentController {

  /**
   * Construct
   *
   * @param DocumentRepository $document
   */
  public function __construct(Document $document){

    parent::__construct($document);

    $this->document_type = DocumentType::STATE;
    $this->document_ident = "stateId";

  }

    
  /**
   * Handle Single and Multiple GETs and CORS PUT/POST/DELETE requests
   * Return a list of stateId's based on activityId and actor match.
   *
   * @return Response
   */
  public function all(){

    $data = $this->checkParams(array(
      'activityId' => 'string',
      'agent'      => array('string', 'json')
    ), array(
      'registration' => 'string',
      'since'        => array('string', 'timestamp')
    ), $this->params );

    $documents = $this->document->all( $this->lrs->_id, $this->document_type, $data );
    
    //return array of only the stateId values for each document
    $stateIds = array_column($documents->toArray(), 'stateId');
    return \Response::json( $stateIds );
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
        'stateId'  => 'string',
        'agent'      => array('string', 'json')
      ),
      array(
        'registration' => 'string'
      ), 
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
        'agent'      => array('string', 'json'),
        'stateId'    => 'string'
      ),
      array(
        'registration' => 'string'
      ),
      $this->params
    );

    /*
    //Retrieve the content type headers
    $header = \Request::header('Content-Type');
    dd( $header );
    if( !is_null($header) ){
      $data['contentType'] = $header;
    } else {
      \App::abort(400, 'A Content-Type must be included');
    }
    */
   

    //Get the content from the request
    $data['content_info'] = $this->getAttachedContent('content');



    //Get the updated parameter from the header and check formatting
    $updated = \Request::header('Updated');
    if( !empty($updated) ){
      if( !$this->validateTimestamp($updated) ){
        \App::abort(400, sprintf( "`%s` is not an valid ISO 8601 formatted timestamp", $updated ) );
      }
    } else {
      $updated = Carbon::now()->toISO8601String();
    }

    //Store the document
    $store = $this->document->store( $this->lrs->_id, $this->document_type, $data, $updated, $this->method );

    if( $store ){
      return \Response::json( array( 'ok', 204 ) );
    }

    return \Response::json( array( 'error', 400 ) );

  }

  /**
   * Handle single and multiple document delete
   *
   * @param  int  $id
   * @return Response
   */
  public function delete(){
    
  }

}