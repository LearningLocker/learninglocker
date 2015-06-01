<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;
use Locker\Repository\Document\DocumentType as DocumentType;

class AgentController extends DocumentController {

  // Defines properties to be set to constructor parameters.
  protected $document;

  // Overrides parent's properties.
  protected $identifier = 'profileId';
  protected $required = [
    'agent' => 'agent',
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

    $agent = (array) $this->getIndexData()[key($this->required)];
    $agents = $this->document->all(
      $this->getOptions(),
      $this->document_type,
      $this->getIndexData([
        'since' => ['string', 'timestamp']
      ])
    )->toArray();
    $agents = array_column($agents, 'agent');

    $person = (object) [
      'objectType' => 'Person',
      'name' => array_unique(array_column($agents, 'name')),
      'mbox' => array_unique(array_column($agents, 'mbox')),
      'mbox_sha1sum' => array_unique(array_column($agents, 'mbox_sha1sum')),
      'openid' => array_unique(array_column($agents, 'openid')),
      'account' => array_unique(array_column($agents, 'account'))
    ];

    return \Response::json($person);
  }
}
