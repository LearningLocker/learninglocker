<?php namespace Controllers\xAPI;

use \Locker\Repository\Statement\Repository as Statement;
use \Locker\Helpers\Attachments as Attachments;
use \Locker\Helpers\Exceptions as Exceptions;
use \Locker\Helpers\Helpers as Helpers;

class StatementController extends BaseController {

  // Sets constants for param keys.
  const STATEMENT_ID = 'statementId';
  const VOIDED_ID = 'voidedStatementId';

  // Defines properties to be set to constructor parameters.
  protected $statement, $query;

  // Defines properties to be set by the constructor.
  protected $params, $method, $lrs;

  /**
   * @override
   * Constructs a new StatementController.
   * @param StatementRepository $statement
   */
  public function __construct(Statement $statement) {
    parent::__construct();
    $this->statements = $statement;
    $this->index_controller = new StatementIndexController($statement);
    $this->store_controller = new StatementStoreController($statement);
  }

  /**
   * @override
   * GETs statements.
   * @return Response statement(s).
   */
  public function get() {
    // Runs filters.
    if ($result = $this->validateIds()) return $result;
    if ($result = $this->checkVersion()) return $result;

    // Attempts to get IDs from the params.
    $statementId = \LockerRequest::getParam(self::STATEMENT_ID);
    $voidedId = \LockerRequest::getParam(self::VOIDED_ID);

    // Selects the correct method for getting.
    if ($statementId && !$voidedId) {
      return $this->show($statementId, false);
    } else if ($voidedId && !$statementId) {
      return $this->show($voidedId, true);
    } else {
      return $this->index();
    }
  }

  /**
   * Updates (PUTs) Statement with the given id.
   * @return Response
   */
  public function update() {
    // Runs filters.
    if ($result = $this->checkVersion()) return $result;
    return $this->store_controller->update($this->getOptions());
  }

  /**
   * Updates (PUTs) Statement with the given id.
   * @return Response
   */
  public function store() {
    // Runs filters.
    if ($result = $this->checkVersion()) return $result;
    return $this->store_controller->store($this->getOptions());
  }

  /**
   * Gets an array of statements.
   * @return Response
   */
  public function index() {
    return $this->index_controller->index($this->getOptions());
  }

  /**
   * Gets the statement with the given $id.
   * @param String $id Statement's UUID.
   * @param boolean $voided determines if the statement is voided.
   * @return Response
   */
  public function show($id, $voided = false) {
    // Runs filters.
    if ($result = $this->checkVersion()) return $result;

    $statement = $this->statements->show($id, array_merge([
      'voided' => $voided
    ], $this->getOptions()));

    return \Response::json(Helpers::replaceHtmlEntity($statement), 200);
  }

  /**
   * Checks params to comply with requirements.
   * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements
   **/
  private function validateIds() {
    // Attempts to get IDs from the params.
    $statementId = \LockerRequest::getParam(self::STATEMENT_ID);
    $voidedId = \LockerRequest::getParam(self::VOIDED_ID);

    // Returns an error if both `statementId` and `voidedId` are set.
    if ($statementId && $voidedId) {
      throw new Exceptions\Exception(
        'You can\'t request based on both`' . self::STATEMENT_ID . '` and `' . self::VOIDED_ID . '`'
      );
    }

    // Checks that params are allowed if `statementId` or `voidedId` are set.
    else if ($statementId || $voidedId) {
      $allowedParams = ['content', self::STATEMENT_ID, self::VOIDED_ID, 'attachments', 'format'];

      // Returns an error if a $key is not an allowed param.
      foreach ($this->params as $key => $value) {
        if (!in_array($key, $allowedParams)) {
          throw new Exceptions\Exception(
            'When using `' . self::STATEMENT_ID . '` or `' . self::VOIDED_ID . '`, the only other parameters allowed are `attachments` and/or `format`.'
          );
        }
      }
    }
  }
}
