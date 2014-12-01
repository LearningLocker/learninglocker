<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;
use Locker\Repository\Document\DocumentType as DocumentType;

class StateController extends DocumentController {

  // Defines properties to be set to constructor parameters.
  protected $document;

  // Overrides parent's properties.
  protected $identifier = 'stateId';
  protected $required = [
    'activityId' => 'iri',
    'agent' => 'agent',
    'stateId' => 'string'
  ];
  protected $optional = [
    'registration' => 'uuid'
  ];
  protected $document_type = DocumentType::STATE;

  /**
   * Handles routing to single and multiple document delete requests
   *
   * @param  int  $id
   * @return Response
   */
  public function destroy(){
    // Runs filters.
    if ($result = $this->checkVersion()) return $result;

    $singleDelete = \LockerRequest::hasParam($this->identifier);

    if ($singleDelete) {
      $data = $this->getShowData();
    } else {
      $data = $this->getIndexData();
    }

    return $this->completeDelete($data, $singleDelete);
  }

}
