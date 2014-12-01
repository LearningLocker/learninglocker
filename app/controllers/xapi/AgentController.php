<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;
use Locker\Repository\Document\DocumentType as DocumentType;

class AgentController extends DocumentController {

  // Defines properties to be set to constructor parameters.
  protected $document;

  // Overrides parent's properties.
  protected $identifier = 'profileId';
  protected $required = [
    'agent' => 'string',
    'profileId' => 'string'
  ];
  protected $document_type = DocumentType::AGENT;

  /**
   * Returns (GETs) a Person.
   * @return Response
   **/
  public function search() {
    // Runs filters.
    if ($result = $this->checkVersion()) return $result;

    $agent = (array) $this->getShowData()[key($required)];
    $person = ['objectType' => 'Person'];

    $keys = ['name', 'mbox', 'mbox_sha1sum', 'openid', 'account'];
    foreach ($keys as $key) {
      if (isset($agent[$key])) {
        $person[$key] = [$agent[$key]];
      }
    }

    return \Response::json($person);
  }
}
