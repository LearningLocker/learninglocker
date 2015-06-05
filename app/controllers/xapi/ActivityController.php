<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;
use Locker\Repository\Document\DocumentType as DocumentType;

class ActivityController extends DocumentController {

  // Defines properties to be set to constructor parameters.
  protected $activity, $document;

  // Overrides parent's properties.
  protected $identifier = 'profileId';
  protected $required = [
    'activityId' => 'iri',
    'profileId' => 'string'
  ];
  protected $document_type = DocumentType::ACTIVITY;

  /**
   * Constructs a new ActivityController.
   * @param Document $document
   * @param Activity $activity
   */
  public function __construct(Document $document){
    parent::__construct($document);
  }

  /**
   * Returns the full activity object.
   * @return Response
   **/
  public function full() {
    // Runs filters.
    if ($result = $this->checkVersion()) return $result;

    $documents = $this->document->all(
      $this->getOptions(),
      $this->document_type,
      $this->getIndexData([
        'since' => ['string', 'timestamp']
      ])
    )->toArray();
    $contents = array_column($documents, 'content');

    return \Response::json([
      'objectType' => 'Activity',
      'id' => array_column($documents, 'activityId')[0],
      'definition' => (object) array_reduce(array_column($contents, 'definition'), function ($carry, $item) {
        return array_merge_recursive($carry, $item);
      }, [])
    ]);
  }
}
