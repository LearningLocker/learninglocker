<?php namespace Controllers\xAPI;

use \Locker\Repository\Statement\StatementRepository as Statement;
use \App\Locker\Helpers\Attachments;

class StatementController extends BaseController {

  // Sets constants for param keys.
  const STATEMENT_ID = 'statementId';
  const VOIDED_ID = 'voidedStatementId';

  // Defines properties to be set to constructor parameters.
  protected $statement;

  // Defines properties to be set by the constructor.
  protected $params, $method, $lrs;

  /**
   * @override
   * Constructs a new StatementController.
   * @param StatementRepository $statement
   */
  public function __construct(Statement $statement) {
    $this->statement = $statement;
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

    // Attempts to get IDs from the params.
    $statementId = \LockerRequest::getParam(self::STATEMENT_ID);
    $voidedId = \LockerRequest::getParam(self::VOIDED_ID);

    // Selects the correct method for getting.
    if ($statementId && !$voidedId) {
      return $this->show($statementId);
    } else if ($voidedId && !$statementId) {
      return $this->show($voidedId);
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
    return $this->sendResponse($this->statement->create(
      $statements,
      $this->lrs,
      $attachments
    ));

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
      return $this->sendResponse(['success' => 'noId']);
    }

    // Attempts to create the statement if `statementId` is present.
    $statement['id'] = $statementId;
    $save = $this->statement->create([$statement], $this->lrs, '');

    // Sends a response.
    if ($save['success'] == 'true') {
      return $this->sendResponse(['success' => 'put']);
    } else {
      return $this->sendResponse($save);
    }
  }

  /**
   * Gets an array of statements.
   * @return Response
   */
  public function index() {
    return $this->returnArray(
      $this->statement->all( $this->lrs->_id, $this->params )->toArray(),
      $this->params
    );
  }

  public function grouped(){
    return $this->returnArray(
      $this->statement->grouped($this->lrs->_id, $this->params),
      $this->params
    );
  }

  /**
   * Gets the statement with the given $id.
   * @return Statement
   */
  public function show($id) {
    // Runs filters.
    if ($result = $this->checkVersion()) return $result;

    $statement = $this->statement->find($id);

    // Returns the statement if the requester can access this statement.
    if ($this->checkAccess($statement)) {
      return $this->returnArray( array($statement->toArray()) );
    } else {
      return BaseController::errorResponse(
        'You are not authorized to access this statement.',
        BaseController::NO_AUTH
      );
    }

  }

  /**
   * Determines if a $statement is in the current LRS.
   * @param Statement $statement
   * @return boolean `true` if the $statement is in the current LRS.
   **/
  public function checkAccess($statement) {
    $statement_lrs = $statement['lrs']['_id'];
    return $statement_lrs == $this->lrs->_id;
  }

  /**
   * Constructs a response for $statements.
   * @param array $statements Statements to return.
   * @param array $params Filter.
   * @param array $debug Log for debgging information.
   * @return response
   **/
  const DEFAULT_LIMIT = 100; // @todo make this configurable.
  public function returnArray($statements=[], $params=[], $debug=[]) {
    // Adds 'about resouce' information required by specification.
    // Adds 'X-Experience-API-Version' for LL backwards compatibility.
    // https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#77-about-resource
    $array = [
      'X-Experience-API-Version' => \Config::get('xapi.using_version'),
      'version' => [\Config::get('xapi.using_version')]
    ];

    // Replaces '&46;' in keys with '.' in statements.
    // http://docs.learninglocker.net/docs/statements#quirks
    $statements = $statements ?: [];
    foreach ($statements as &$s) {
      $s = \app\locker\helpers\Helpers::replaceHtmlEntity($s['statement']);
    }

    $array['statements'] = $statements;
    $array['total'] = $this->statement->count($this->lrs->_id, $this->params);

    // Calculates the next offset.
    $limit = \LockerRequest::getParam('limit', self::DEFAULT_LIMIT);
    $offset = \LockerRequest::getParam('offset', null);
    $nextOffset = $offset ? $offset += $limit : $limit;

    // Sets the `more` and `offset` url param.
    if ($array['total'] > $nextOffset) {
      // Get the current request URI.
      $url = $_SERVER['REQUEST_URI'];

      // Changes the offset if it does exist.
      if ($offset) {
        $url = str_replace(
          'offset=' . $offset,
          'offset=' . $nextOffset,
          $url
        );
      }

      // Adds the offset if it does not exist.
      else {
        // If there are already params then append otherwise start.
        $url .= strpos($url, '?') !== False ? '&' : '?';
        $url .= 'offset=' . $nextOffset;
      }

      // Sets the more link to the new url.
      $array['more'] = $url;
    } else {
      $array['more'] = '';
    }

    $response = \Response::make($array, BaseController::OK);

    // Sets 'X-Experience-API-Consistent-Through' header to the current date.
    $current_date = \DateTime::createFromFormat('U.u', sprintf('%.4f', microtime(true)));
    $current_date->setTimezone(new \DateTimeZone(\Config::get('app.timezone')));
    $current_date = $current_date->format('Y-m-d\TH:i:s.uP');
    $response->headers->set('X-Experience-API-Consistent-Through', $current_date);

    return $response;
  }

  /**
   * Sets and sends back the approriate response for the $outcome.
   * @param array $outcome.
   * @return Response.
   **/
  public function sendResponse($outcome) {
    switch ($outcome['success']) {
      case 'true':
        return \Response::json($outcome['ids'], BaseController::OK);
      case 'conflict-nomatch':
        return BaseController::errorResponse(null, BaseController::CONFLICT);
      case 'conflict-matches':
        return \Response::json([], BaseController::NO_CONTENT);
      case 'put':
        return \Response::json(['success'  => true], BaseController::NO_CONTENT);
      case 'noId':
        return BaseController::errorResponse('A statement ID is required to PUT.');
      case 'false':
        return BaseController::errorResponse(implode($outcome['message']));
    }
  }

  /**
   * Checks params to comply with requirements.
   * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements
   **/
  public function validateIds() {
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
