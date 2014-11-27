<?php namespace Controllers\xAPI;

use \Locker\Repository\Statement\StatementRepository as Statement;
use \Locker\Repository\Query\QueryRepository as Query;
use \App\Locker\Helpers\Attachments;

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
    $this->statement = $statement;
    $this->query = $query;
    parent::__construct();
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
   * Stores (POSTs) a newly created statement in storage.
   * @return Response
   */
  public function store() {
    // Validates request.
    if ($result = $this->checkVersion()) return $result;

    $content = \LockerRequest::getContent();

    // Gets the content type.
    $types = explode(';', \LockerRequest::header('content-type'), 2);
    $mimeType = count($types) >= 1 ? $types[0] : $types;

    // Deals with physical attachments.
    if ($mimeType == 'multipart/mixed') {
      $components = Attachments::setAttachments($contentType, $content);

      // Returns 'formatting' error.
      if (empty($components)) {
        return BaseController::errorResponse(
          'There is a problem with the formatting of your submitted content.'
        );
      }

      // Returns 'no attachment' error.
      if (!isset($components['attachments'])) {
        return BaseController::errorResponse(
          'There were no attachments.',
          BaseController::NO_AUTH
        );
      }

      $content = $components['body'];
      $attachments = $components['attachments'];
    } else {
      $attachments = '';
    }

    $statements = json_decode($content, true);

    // Ensures that $statements is an array.
    if (!is_array(json_decode($content))) {
      $statements = [$statements];
    }

    // Saves $statements with $attachments.
    try {
      return $this->statement->create(
        $statements,
        $this->lrs,
        $attachments
      );
    } catch (\Exception $e) {
      return BaseController::errorResponse($e->getMessage(), 400);
    }
  }

  /**
   * Updates (PUTs) Statement with the given id.
   * @return Response
   */
  public function update() {
    // Runs filters.
    if ($result = $this->checkVersion()) return $result;

    // Decodes the statement.
    $statement = json_decode(\LockerRequest::getContent(), true);

    $statementId = \LockerRequest::getParam(self::STATEMENT_ID);

    // Returns a error if identifier is not present.
    if (!$statementId) {
      return BaseController::errorResponse('A statement ID is required to PUT.');
    }

    // Attempts to create the statement if `statementId` is present.
    $statement['id'] = $statementId;
    $save = $this->statement->create([$statement], $this->lrs);
    return \Response::json(null, BaseController::NO_CONTENT);
  }

  private function jsonParam($param, $default = null) {
    $paramValue = \LockerRequest::getParam($param, $default);
    $decoded = gettype($paramValue) === 'string' ? json_decode($paramValue, true) : $paramValue;
    $value = isset($decoded) ? $decoded : $paramValue;
    return $value;
  }

  /**
   * Gets an array of statements.
   * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements
   * @return StatementResult
   */
  public function index() {
    // Gets the filters from the request.
    $filters = [
      'agent' => $this->jsonParam('agent'),
      'activity' => $this->jsonParam('activity'),
      'verb' => $this->jsonParam('verb'),
      'registration' => $this->jsonParam('registration'),
      'since' => $this->jsonParam('since'),
      'until' => $this->jsonParam('until'),
      'active' => $this->jsonParam('active', true),
      'voided' => $this->jsonParam('voided', false)
    ];


    // Gets the options/flags from the request.
    $options = [
      'related_activity' => $this->jsonParam('related_activity', false),
      'related_agents' => $this->jsonParam('related_agents', false),
      'ascending' => $this->jsonParam('ascending', true),
      'format' => $this->jsonParam('format', 'exact'),
      'offset' => $this->jsonParam('offset', 0),
      'limit' => $this->jsonParam('limit')
    ];

    // Gets the $statements from the LRS (with the $lrsId) that match the $filters with the $options.
    try {
      $statements = $this->statement->index(
        $this->lrs->_id,
        $filters,
        $options
      );
    } catch (\Exception $e) {
      return BaseController::errorResponse($e->getMessage(), 400);
    }

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
    return $this->makeStatementObject($statements, [
      'total' => $total,
      'offset' => $options['offset'],
      'limit' => $options['limit']
    ]);
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
      return $statement['statement'];
    } else {
      return \Response::json(null, 404);
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
      'offset' => 0,
      'limit' => null
    ], $options);

    // Replaces '&46;' in keys with '.' in statements.
    // http://docs.learninglocker.net/docs/statements#quirks
    $statements = $statements ?: [];
    foreach ($statements as &$s) {
      $s = \app\locker\helpers\Helpers::replaceHtmlEntity($s['statement']);
    }

    // Creates the statement result.
    $statementResult = [
      'X-Experience-API-Version' => \Config::get('xapi.using_version'),
      'version' => [\Config::get('xapi.using_version')],
      'total' => $options['total'],
      'more' => $this->getMoreLink($options['total'], $options['limit'], $options['offset']),
      'statements' => \app\locker\helpers\Helpers::replaceHtmlEntity($statements)
    ];

    // Creates the response.
    $response = \Response::make($statementResult, BaseController::OK);
    $response->headers->set(
      'X-Experience-API-Consistent-Through',
      $this->statement->getCurrentDate()
    );

    return $response;
  }

  /**
   * Gets the more link.
   * @param int $total the number of statements matching the filter.
   * @param int $limit the number of statements to be returned.
   * @param int $offset the number of statements to skip.
   * @return URL
   */
  private function getMoreLink($total, $limit, $offset = 0) {
    $nextOffset = $offset + $limit;

    if ($total <= $nextOffset) return '';

    // Get the current request URI.
    $url = 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . "{$_SERVER['HTTP_HOST']}/{$_SERVER['REQUEST_URI']}";

    // Changes the offset if it does exist, otherwise it adds it.
    if ($offset) {
      return str_replace(
        'offset=' . $offset,
        'offset=' . $nextOffset,
        $url
      );
    } else {
      // If there are already params then append otherwise start.
      $separator = strpos($url, '?') !== False ? '&' : '?';
      return $url . $separator . 'offset=' . $nextOffset;
    }
  }

  /**
   * Sets and sends back the approriate response for the $outcome.
   * @param array $outcome.
   * @return Response.
   **/
  private function sendResponse($outcome) {
    switch ($outcome['success']) {
      case 'true':
        return \Response::json($outcome['ids'], BaseController::OK);
      case 'conflict-nomatch':
        return BaseController::errorResponse(null, BaseController::CONFLICT);
      case 'conflict-matches':
        return \Response::json([], BaseController::NO_CONTENT);
      case 'false':
        return BaseController::errorResponse(implode($outcome['message']));
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
      return BaseController::errorResponse(
        'You can\'t request based on both`' . self::STATEMENT_ID . '` and `' . self::VOIDED_ID . '`'
      );
    }

    // Checks that params are allowed if `statementId` or `voidedId` are set.
    else if ($statementId || $voidedId) {
      $allowedParams = ['content', self::STATEMENT_ID, self::VOIDED_ID, 'attachments', 'format'];

      // Returns an error if a $key is not an allowed param.
      foreach ($this->params as $key => $value) {
        if (!in_array($key, $allowedParams)) {
          return BaseController::errorResponse(
            'When using `' . self::STATEMENT_ID . '` or `' . self::VOIDED_ID . '`, the only other parameters allowed are `attachments` and/or `format`.'
          );
        }
      }
    }
  }
}
