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
   * Display a listing of the resource.
   *
   * @return Response
   */
  public function index(){
    $data = $this->checkParams(array(
      'activityId' => 'string',
      'profileId'  => 'string'
    ), array('since' => 'timestamp'), $this->params );

    $documents = $this->document->all( $this->lrs->_id, $data, $this->document_type );

    return \Response::json( $documents->toArray() );
  }

  /**
   * Store a newly created resource in storage.
   *
   * @return Response
   */
  public function store(){
    
    $activity = $this->checkParams( 
      array(
        'activityId' => 'string',
        'profileId'  => 'string',
        'content'    => ''
      ),
      array(),
      $this->params
    );


    $store = $this->document->store( $this->lrs->_id, $activity, $this->document_type );

    if( $store ){
      return \Response::json( array( 'ok', 204 ) );
    }

    return \Response::json( array( 'error', 400 ) );

  }

  /**
   * Display the specified resource.
   *
   * @param  int  $id
   * @return Response
   */
  public function show( $activityId, $profileId ){

    $document = $this->document->find( $this->lrs->_id, $activityId, $profileId );

    return \Response::json( $document->toArray() );
  }

  /**
   * Update the specified resource in storage.
   *
   * @param  int  $id
   * @return Response
   */
  public function update($id)
  {
    //
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param  int  $id
   * @return Response
   */
  public function destroy($id)
  {
    //
  }

  /**
   * Return the full activity object
   *
   * @param int $activityId
   * @return Response
   *
   **/
  public function full( $activityId ){

  }


}