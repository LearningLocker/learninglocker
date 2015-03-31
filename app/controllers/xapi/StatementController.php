<?php namespace Controllers\xAPI;

use \Locker\Repository\Statement\StatementRepository as Statement;
use \Locker\Repository\Query\QueryRepository as Query;
use \Locker\Helpers\Attachments as Attachments;
use \Locker\Helpers\Exceptions as Exceptions;

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
  public function __construct(Statement $statement, Query $query) {
    parent::__construct();
    $this->statement = $statement;
    $this->query = $query;
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
      $attachments = '';
    }

    return [
      'content' => $content,
      'attachments' => $attachments
    ];
  }

  private function checkContentType() {
    $contentType = \LockerRequest::header('Content-Type');
    if ($contentType === null) {
      throw new Exceptions\Exception('Missing Content-Type.');
    }

    $validator = new \app\locker\statements\xAPIValidation();
    $validator->checkTypes('Content-Type', $contentType, 'contentType', 'headers');
    if ($validator->getStatus() !== 'passed') {
      throw new Exceptions\Exception(implode(',', $validator->getErrors()));
    }
  }

  /**
   * Stores (POSTs) a newly created statement in storage.
   * @return Response
   */
  public function store() {
    // Validates request.
    if ($result = $this->checkVersion()) return $result;
    if ($result = $this->checkContentType()) return $result;
    if (\LockerRequest::hasParam(self::STATEMENT_ID)) {
      throw new Exceptions\Exception('Statement ID parameter is invalid.');
    }

    $parts = $this->getParts();
    $content = $parts['content'];
    $attachments = $parts['attachments'];

    $statements = json_decode($content);

    if ($statements === null && $content != 'null' && $content != '') {
      throw new Exceptions\Exception('Invalid JSON');
    }

    // Ensures that $statements is an array.
    if (!is_array($statements)) {
      $statements = [$statements];
    }

    // Saves $statements with $attachments.
    return $this->statement->create(
      $statements,
      $this->lrs,
      $attachments
    );
  }

  /**
   * Updates (PUTs) Statement with the given id.
   * @return Response
   */
  public function update() {
    // Runs filters.
    if ($result = $this->checkVersion()) return $result;
    if ($result = $this->checkContentType()) return $result;

    $parts = $this->getParts();
    $content = $parts['content'];
    $attachments = $parts['attachments'];

    // Decodes the statement.
    $statement = json_decode($content);

    if ($statement === null && $content != 'null' && $content != '') {
      throw new Exceptions\Exception('Invalid JSON');
    }

    $statementId = \LockerRequest::getParam(self::STATEMENT_ID);

    // Returns a error if identifier is not present.
    if (!$statementId) {
      throw new Exceptions\Exception('A statement ID is required to PUT.');
    }

    // Attempts to create the statement if `statementId` is present.
    $statement->id = $statementId;
    $this->statement->create([$statement], $this->lrs, $attachments);
    return \Response::make('', 204);
  }

  /**
   * Gets an array of statements.
   * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements
   * @return StatementResult
   */
  public function index() {
    // Gets the filters from the request.
    $filters = [
      'agent' => $this->validatedParam('agent', 'agent'),
      'activity' => $this->validatedParam('irl', 'activity'),
      'verb' => $this->validatedParam('irl', 'verb'),
      'registration' => $this->validatedParam('uuid', 'registration'),
      'since' => $this->validatedParam('isoTimestamp', 'since'),
      'until' => $this->validatedParam('isoTimestamp', 'until'),
      'active' => $this->validatedParam('boolean', 'active', true),
      'voided' => $this->validatedParam('boolean', 'voided', false)
    ];


    // Gets the options/flags from the request.
    $options = [
      'related_activities' => $this->validatedParam('boolean', 'related_activities', false),
      'related_agents' => $this->validatedParam('boolean', 'related_agents', false),
      'ascending' => $this->validatedParam('boolean', 'ascending', false),
      'format' => $this->validatedParam('string', 'format', 'exact'),
      'offset' => $this->validatedParam('int', 'offset', 0),
      'limit' => $this->validatedParam('int', 'limit', 100),
      'attachments' => $this->validatedParam('boolean', 'attachments', false)
    ];

    // Gets the $statements from the LRS (with the $lrsId) that match the $filters with the $options.
    $statements = $this->statement->index(
      $this->lrs->_id,
      $filters,
      $options
    );

    $total = $statements->count();

    // Gets the statements and uses offset and limit options.
    $statements->skip((int) $options['offset']);
    $statements->take((int) $options['limit']);
    $statements = $statements->get()->toArray();

    // Selects an output format.
    if ($options['format'] === 'ids') {
      $statements = $this->statement->toIds($statements);
    } else if ($options['format'] === 'canonical') {
      $langs = \Request::header('Accept-Language');
      $langs = $langs !== '' ? explode(',', $langs) : [];
      $statements = $this->statement->toCanonical($statements, $langs);
    }

    // Returns the StatementResult object.
    $statement_result = json_encode($this->makeStatementObject($statements, [
      'total' => $total,
      'offset' => $options['offset'],
      'limit' => $options['limit']
    ]));

    if ($options['attachments'] === true) {
      $boundary = 'abcABC0123\'()+_,-./:=?';
      $content_type = 'multipart/mixed; boundary='.$boundary;
      $statement_result = "Content-Type:application/json\r\n\r\n".$statement_result;
      $body = "--$boundary\r\n".implode(
        "\r\n--$boundary\r\n",
        array_merge([$statement_result], $this->statement->getAttachments($statements, $this->lrs->_id))
      )."\r\n--$boundary--";
    } else {
      $content_type = 'application/json;';
      $body = $statement_result;
    }

    // Creates the response.
    return \Response::make($body, BaseController::OK, [
      'Content-Type' => $content_type,
      'X-Experience-API-Consistent-Through' => $this->statement->getCurrentDate()
    ]);;
  }

  /**
   * Gets the statement with the given $id.
   * @param UUID $id
   * @param boolean $voided determines if the statement is voided.
   * @return Statement
   */
  public function show($id, $voided = false) {
    // Runs filters.
    if ($result = $this->checkVersion()) return $result;

    $statement = $this->statement->show($this->lrs->_id, $id, $voided)->first();
    if ($statement) {
      $dotted_statement = \Locker\Helpers\Helpers::replaceHtmlEntity(
        $statement->statement
      );
      return \Response::json($dotted_statement, 200);
    } else {
      throw new Exceptions\NotFound($id, 'Statement');
    }
  }

  /**
   * Constructs a response for $statements.
   * @param array $statements Statements to return.
   * @param array $params Filter.
   * @param array $debug Log for debgging information.
   * @return response
   **/
  private function makeStatementObject(array $statements, array $options) {
    // Merges options with default options.
    $options = array_merge([
      'total' => count($statements),
      'offset' => null,
      'limit' => null
    ], $options);

    // Replaces '&46;' in keys with '.' in statements.
    // http://docs.learninglocker.net/docs/statements#quirks
    $statements = $statements ?: [];
    $statements = \Locker\Helpers\Helpers::replaceHtmlEntity($statements);
    foreach ($statements as &$s) {
      $s = $s->statement;
    }

    // Creates the statement result.
    $statement_result = [
      'more' => $this->getMoreLink($options['total'], $options['limit'], $options['offset']),
      'statements' => $statements
    ];

    return $statement_result;
  }

  /**
   * Constructs the "more link" for a statement response.
   * @param Integer $total Number of statements that can be returned for the given request parameters.
   * @param Integer $limit Number of statements to be outputted in the response.
   * @param Integer $offset Number of statements being skipped.
   * @return String A URL that can be used to get more statements for the given request parameters.
   */
  private function getMoreLink($total, $limit, $offset) {
    // Uses defaults.
    $total = $total ?: 0;
    $limit = $limit ?: 100;
    $offset = $offset ?: 0;

    // Calculates the $next_offset.
    $next_offset = $offset + $limit;
    if ($total <= $next_offset) return '';

    // Changes (when defined) or appends (when undefined) offset.
    $query = \Request::getQueryString();
    $statement_route = \URL::route('xapi.statement', [], false);
    $current_url = $query ? $statement_route.'?'.$query : $statement_route;

    if (strpos($query, "offset=$offset") !== false) {
      return str_replace(
        'offset=' . $offset,
        'offset=' . $next_offset,
        $current_url
      );
    } else {
      $separator = strpos($current_url, '?') !== False ? '&' : '?';
      return $current_url . $separator . 'offset=' . $next_offset;
    }
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
