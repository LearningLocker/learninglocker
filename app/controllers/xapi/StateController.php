<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;
use Locker\Repository\Document\DocumentType as DocumentType;

class StateController extends DocumentController {

  // Defines properties to be set to constructor parameters.
  protected $document;

  // Overrides parent's properties.
  protected $identifier = 'profileId';
  protected $required = [
    'activityId' => 'string',
    'agent' => ['string', 'json'],
    'stateId'    => 'string'
  ];
  protected $optional = [
    'registration' => 'string'
  ];
  protected $document_type = DocumentType::AGENT;

  /**
   * Handles routing to single and multiple document delete requests
   *
   * @param  int  $id
   * @return Response
   */
  public function delete(){
    $singleDelete = !\LockerRequest::hasParam($this->identifier);

    if ($singleDelete) {
      $data = $this->getShowData();
    } else {
      $data = $this->getIndexData();
    }

    return $this->completeDelete($data, $singleDelete);
  }

}