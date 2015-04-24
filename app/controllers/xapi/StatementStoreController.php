<?php namespace Controllers\xAPI;

use \Locker\Repository\Statement\Repository as StatementRepo;
use \Locker\Helpers\Attachments as Attachments;
use \Locker\Helpers\Exceptions as Exceptions;
use \Locker\Helpers\Helpers as Helpers;
use \Locker\XApi\IMT as XApiImt;
use \LockerRequest as LockerRequest;
use \Response as IlluminateResponse;

class StatementStoreController {

  /**
   * Constructs a new StatementStoreController.
   * @param StatementRepo $statement_repo
   */
  public function __construct(StatementRepo $statement_repo) {
    $this->statements = $statement_repo;
  }

  /**
   * Deals with multipart requests.
   * @return ['content' => $content, 'attachments' => $attachments].
   */
  private function getParts() {
    $content = \LockerRequest::getContent();
    $contentType = \LockerRequest::header('content-type');
    $types = explode(';', $contentType, 2);
    $mimeType = count($types) >= 1 ? $types[0] : $types;

    if ($mimeType == 'multipart/mixed') {
      $components = Attachments::setAttachments($contentType, $content);

      // Returns 'formatting' error.
      if (empty($components)) {
        throw new Exceptions\Exception('There is a problem with the formatting of your submitted content.');
      }

      // Returns 'no attachment' error.
      if (!isset($components['attachments'])) {
        throw new Exceptions\Exception('There were no attachments.');
      }

      $content = $components['body'];
      $attachments = $components['attachments'];
    } else {
      $attachments = [];
    }

    return [
      'content' => $content,
      'attachments' => $attachments
    ];
  }

  /**
   * Stores (POSTs) a newly created statement in storage.
   * @param String $lrs_id
   * @return Response
   */
  public function store($lrs_id) {
    if (LockerRequest::hasParam(StatementController::STATEMENT_ID)) {
      throw new Exceptions\Exception('Statement ID parameter is invalid.');
    }

    return IlluminateResponse::json($this->createStatements($lrs_id), 200, Helpers::getCORSHeaders());
  }

  /**
   * Updates (PUTs) Statement with the given id.
   * @param String $lrs_id
   * @return Response
   */
  public function update($lrs_id) {
    $this->createStatements($lrs_id, function ($statements) {
      $statement_id = \LockerRequest::getParam(StatementController::STATEMENT_ID);

      // Returns a error if identifier is not present.
      if (!$statement_id) {
        throw new Exceptions\Exception('A statement ID is required to PUT.');
      }

      // Adds the ID to the statement.
      $statements[0]->id = $statement_id;
      return $statements;
    });

    return IlluminateResponse::make('', 204, Helpers::getCORSHeaders());
  }

  /**
   * Creates statements from the content of the request.
   * @param String $lrs_id
   * @param Callable|null $modifier A function that modifies the statements before storing them.
   * @return AssocArray Result of storing the statements.
   */
  private function createStatements($lrs_id, Callable $modifier = null) {
    Helpers::validateAtom(new XApiImt(LockerRequest::header('Content-Type')));

    // Gets parts of the request.
    $parts = $this->getParts();
    $content = $parts['content'];

    // Decodes $statements from $content.
    $statements = json_decode($content);
    if ($statements === null && $content !== '') {
      throw new Exceptions\Exception('Invalid JSON');
    } else if ($statements === null) {
      $statements = [];
    }

    // Ensures that $statements is an array.
    if (!is_array($statements)) {
      $statements = [$statements];
    }

    // Runs the modifier if there is one and there are statements.
    if (count($statements) > 0 && $modifier !== null) {
      $statements = $modifier($statements);
    }

    // Saves $statements with attachments.
    return $this->statements->store(
      $statements,
      is_array($parts['attachments']) ? $parts['attachments'] : [],
      [
        'lrs_id' => $lrs_id,
        'authority' => $this->getAuthority()
      ]
    );
  }

  private function getAuthority() {
    $client = (new \Client)
      ->where('api.basic_key', \LockerRequest::getUser())
      ->where('api.basic_secret', \LockerRequest::getPassword())
      ->first();

    if ($client != null && isset($client['authority'])) {
      return json_decode(json_encode($client['authority']));
    } else {
      $site = \Site::first();
      return (object) [
        'name' => $site->name,
        'mbox' => 'mailto:' . $site->email,
        'objectType' => 'Agent'
      ];
    }
  }
}
