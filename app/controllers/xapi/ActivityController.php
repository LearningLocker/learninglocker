<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;
use \Locker\Repository\Activity\ActivityRepository as Activity;
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
  public function __construct(Document $document, Activity $activity){
    parent::__construct($document);
    $this->activity = $activity;
  }

  /**
   * Returns the full activity object.
   * @return Response
   **/
  public function full() {
    // Runs filters.
    if ($result = $this->checkVersion()) return $result;

    return \Response::json(
      $this->activity->getActivity(
        $this->getIndexData()[key($required)]
      )
    );
  }
}
