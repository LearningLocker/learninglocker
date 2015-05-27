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
    $contentType = \LockerRequest::header('Content-Type');
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
   * @param [String => mixed] $options
   * @return Response
   */
  public function store($options) {
    if (LockerRequest::hasParam(StatementController::STATEMENT_ID)) {
      throw new Exceptions\Exception('Statement ID parameter is invalid.');
    }

    return IlluminateResponse::json($this->createStatements($options), 200, $this->getCORSHeaders());
  }

  /**
   * Updates (PUTs) Statement with the given id.
   * @param [String => mixed] $options
   * @return Response
   */
  public function update($options) {
    $this->createStatements($options, function ($statements) {
      $statement_id = \LockerRequest::getParam(StatementController::STATEMENT_ID);

      // Returns a error if identifier is not present.
      if (!$statement_id) {
        throw new Exceptions\Exception('A statement ID is required to PUT.');
      }

      // Adds the ID to the statement.
      $statements[0]->id = $statement_id;
      return $statements;
    });

    return IlluminateResponse::make('', 204, $this->getCORSHeaders());
  }

  /**
   * Creates statements from the content of the request.
   * @param [String => mixed] $options
   * @param Callable|null $modifier A function that modifies the statements before storing them.
   * @return AssocArray Result of storing the statements.
   */
  private function createStatements($options, Callable $modifier = null) {
    Helpers::validateAtom(new XApiImt(explode(';', LockerRequest::header('Content-Type'))[0]));

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
      array_merge([
        'authority' => $this->getAuthority($options['client'])
      ], $options)
    );
  }

  private function getAuthority($client) {
    return json_decode(json_encode($client['authority']));
  }

  /**
   * Gets the CORS headers.
   * @return [String => Mixed] CORS headers.
   */
  private function getCORSHeaders() {
    return [
      'Access-Control-Allow-Origin' => \Request::root(),
      'Access-Control-Allow-Methods' => 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers' => 'Origin, Content-Type, Accept, Authorization, X-Requested-With, X-Experience-API-Version, X-Experience-API-Consistent-Through, Updated',
      'Access-Control-Allow-Credentials' => 'true',
      'X-Experience-API-Consistent-Through' => Helpers::getCurrentDate(),
      'X-Experience-API-Version' => '1.0.1'
    ];
  }
}
