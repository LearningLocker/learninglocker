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

    //Setup a return object
    $result = [
        'objectType'  => 'Activity',
        'id'          => $this->params['activityId'],
        'definition'  => []
    ];

    //Retrieve documents for the activity
    $documents = $this->document->all(
      $this->getOptions(),
      $this->document_type,
      $this->getIndexData([
        'since' => ['string', 'timestamp']
      ])
    );

    //If there are documents, pull out any definitions
    if( $documents->count() > 0 ){
      $documents = $documents->toArray();
      $contents = array_column($documents, 'content');

      $result['definition'] = (object) array_reduce(array_column($contents, 'definition'), function ($carry, $item) {
        return array_merge_recursive($carry, $item);
      }, []);
    }

    //return the result object as JSON
    return \Response::json($result);
  }
}
