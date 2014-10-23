<?php namespace Controllers\xAPI;

use \Locker\Repository\Statement\StatementRepository as Statement;
use \App\Locker\Helpers\Attachments;

class StatementController extends BaseController {

  // Sets constants for status codes.
  const OK = 200;
  const NO_CONTENT = 204;
  const BAD_REQUEST = 400;
  const CONFLICT = 409;

  // Sets constants for param keys.
  const STATEMENT_ID = 'statementId';
  const VOIDED_ID = 'voidedStatementId';

  // Defines properties to be set to constructor parameters.
  protected $statement;

  // Defines properties to be set by filters.
  protected $lrs, $params;

  /**
   * Constructs a new StatementController.
   * @param StatementRepository $statement
   */
  public function __construct(Statement $statement) {
    $this->statement = $statement;

    // Defines which filters to be run.
    $this->beforeFilter('@checkVersion', ['except' => 'index']);
    $this->beforeFilter('@getLrs');
    $this->beforeFilter('@setParameters', ['except' => ['store']]);
    $this->beforeFilter('@reject', ['except' => ['store', 'storePut']]);
  }

  /**
   * Store (POST) a newly created statement in storage.
   * @return Response
   */
  public function store(){
    $content = \LockerRequest::getContent();
    $contentType = \LockerRequest::header('content-type');

    // Gets the actual content type.
    $types = explode(';', $contentType, 2);
    if (count($types) >= 1) {
      $mimeType = $types[0];
    } else {
      $mimeType = $types;
    }
    
    // Deals with physical attachments.
    if( $mimeType == 'multipart/mixed'){
      $components = Attachments::setAttachments($contentType, $content);

      // Returns 'formatting' error.
      if(empty($components)) {
        return \Response::json([
          'error'    => true,
          'message'  => 'There is a problem with the formatting of your submitted content.'
        ], self::BAD_REQUEST);
      }

      // Returns 'no attachment' error.
      if( !isset($components['attachments']) ){
        return \Response::json([
          'error'    => true,
          'message'  => 'There were no attachments.'
        ], 403);
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
   * Stores (PUTs) Statement with the given id.
   * @return Response
   */
  public function storePut() {
    // Decodes the statement.
    $statement = \LockerRequest::getContent();
    $statement = json_decode($statement, true);
    $statementId = $this->getKeyValue($this->params, self::STATEMENT_ID);

    // Returns a 'noId' error if no ID is present.
    if(!$statementId) {
      return $this->sendResponse(['success' => 'noId']);
    }

    // Attempts to create the statement if `statementId` is present.
    else {
      $statement['id'] = $statementId;
      $save = $this->statement->create([$statement], $this->lrs, '');

      // Sends a response.
      if($save['success'] == 'true'){
        return $this->sendResponse(['success' => 'put']);
      } else {
        return $this->sendResponse($save);
      }
    }
  }

  /**
   * Gets the value of a $key from an $array.
   * @param Array $array
   * @param String $key
   * @param mixed $default Value to be returned if the $key is not in the $array.
   * @return mixed Value associated with the $key in the $array.
   */
  public function getKeyValue($array, $key, $default = null) {
    return isset($array[$key]) ? $array[$key] : $default;
  }

  /**
   * Gets an array of statements.
   * @return Response
   */
  public function index() {
    // Attempts to get IDs from the params.
    $statementId = $this->getKeyValue($this->params, self::STATEMENT_ID);
    $voidedId = $this->getKeyValue($this->params, self::VOIDED_ID);

    // Returns an error if both `statementId` and `voidedId` are set.
    if ($statementId && $voidedId) {
      // Error.
    }

    // Returns the statement with `statementId` if ID is given.
    else if ($statementId) {
      return $this->show($statementId);
    }

    // Returns the statement with `voidedId` if ID is given.
    else if ($voidedId) {
      return $this->show($voidedId);
    }

    // Returns array statements if no IDs are given.
    else {
      return $this->returnArray(
        $this->statement->all( $this->lrs->_id, $this->params )->toArray(),
        $this->params
      );
    }

  }

  public function grouped(){
    return $this->returnArray(
      $this->statement->grouped($this->lrs->_id, $this->params),
      $this->params
    );
  }

  /**
   * Gets the statement with the given $id.
   * @param int $id `statementId` or `voidedStatementId`
   * @return Statement
   */
  public function show($id) {
    $statement = $this->statement->find($id);
    
    // Returns the statement if the requester can access this statement.
    if ($this->checkAccess($statement)) {
      return $this->returnArray( array($statement->toArray()) );
    }

    // Returns an authorisation error if the requester can't access this statement.
    else {
      return \Response::json([
        'error'    => true,
        'message'  => 'You are not authorized to access this statement.'
      ], 403);
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
   *
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
    $limit = $this->getKeyValue($this->params, 'limit', self::DEFAULT_LIMIT);
    $offset = $this->getKeyValue($this->params, 'offset', null);
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

    $response = \Response::make($array, self::OK);

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
        return \Response::json($outcome['ids'], self::OK);
      case 'conflict-nomatch':
        return \Response::json(['success'  => false], self::CONFLICT);
      case 'conflict-matches':
        return \Response::json([], self::NO_CONTENT);
      case 'put':
        return \Response::json(['success'  => true], self::NO_CONTENT);
      case 'noId':
        return \Response::json([
          'success'  => false,
          'message' => 'A statement ID is required to PUT.'
        ], self::BAD_REQUEST);
      case 'false':
        return \Response::json([
          'success'  => false,
          'message'  => implode($outcome['message'])
        ], self::BAD_REQUEST);
    }
  }

  /**
   * Checks params to comply with requirements.
   * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements
   **/
  public function reject() {
    // Attempts to get IDs from the params.
    $statementId = $this->getKeyValue($this->params, self::STATEMENT_ID);
    $voidedId = $this->getKeyValue($this->params, self::VOIDED_ID);

    // Returns an error if both `statementId` and `voidedId` are set.
    if ($statementId && $voidedId) {
      return \Response::json([
        'error' => true,
        'message' => 'You can\'t request based on both`' . self::STATEMENT_ID . '` and `' . self::VOIDED_ID . '`'
      ], self::BAD_REQUEST);
    }

    // Checks that params are allowed if `statementId` or `voidedId` are set.
    else if ($statementId || $voidedId) {
      $allowedParams = ['content', self::STATEMENT_ID, self::VOIDED_ID, 'attachments', 'format'];

      // Returns an error if a $key is not an allowed param.
      foreach ($this->params as $key => $value) {
        if (!in_array($key, $allowedParams)) {
          return \Response::json([
            'error' => true, 
            'message' => 'When using `' . self::STATEMENT_ID . '` or `' . self::VOIDED_ID . '`, the only other parameters allowed are `attachments` and/or `format`.'
          ], self::BAD_REQUEST);
        }
      }
    }
  }
}
