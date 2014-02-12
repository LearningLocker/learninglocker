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

  }


  /**
   * Handle Single and Multiple GETs
   * Return a list of stateId's based on activityId and actor match.
   *
   * @return Response
   */
  public function index(){

    //If a stateId is passed then redirect to show method
    if( isset($this->params['stateId']) ){
      return $this->show();
    }

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
  public function show(){

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

    $document = $this->document->find( $this->lrs->_id, $this->document_type, $data );

    if( !$document ){
      \App::abort(204);
    }

    switch( $document->contentType ){
      case "application/json":
        $response = \Response::json($document->content, 200);
      break;
      case "text/plain":
        $response = \Response::make($document->content, 200);
        $response->header('Content-Type', "text/plain");
      break;
      default:
        $response = \Response::make($document->content, 200);
      break;
    }

    return $response;
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
        'stateId'    => 'string',
        'content'    => ''
      ),
      array(
        'registration' => 'string'
      ),
      $this->params
    );

    $updated = \Request::header('Updated');
    if( !empty($updated) ){
      if( !$this->validateTimestamp($updated) ){
        \App::abort(400, sprintf( "`%s` is not an valid ISO 8601 formatted timestamp", $updated ) );
      }
    } else {
      $updated = Carbon::now()->toISO8601String();
    }

    $store = $this->document->store( $this->lrs->_id, $this->document_type, $data, $updated );

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
  public function delete()
  {
    //
  }

}