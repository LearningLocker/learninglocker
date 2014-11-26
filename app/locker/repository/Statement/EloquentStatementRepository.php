<?php namespace Locker\Repository\Statement;

use DateTime;
use Statement;
use Locker\Repository\Activity\ActivityRepository as Activity;
use Locker\Repository\Query\QueryRepository as Query;
use Locker\Repository\Document\FileTypes;
use Illuminate\Database\Eloquent\Builder as Builder;

class EloquentStatementRepository implements StatementRepository {

  // Defines properties to be set to construtor parameters.
  protected $statement, $activity, $query;

  // Number of statements to return by default.
  const DEFAULT_LIMIT = 100;

  /**
   * Constructs a new EloquentStatementRepository.
   * @param Statement $statement
   * @param Activity $activity
   * @param Query $query
   */
  public function __construct(Statement $statement, Activity $activity, Query $query) {
    $this->statement = $statement;
    $this->activity  = $activity;
    $this->query     = $query;
  }

  /**
   * Gets the statement with the given $id from the lrs (with the $lrsId).
   * @param UUID $lrsId
   * @param UUID $id 
   * @param boolean $voided determines if the statement is voided.
   * @param boolean $active determines if the statement is active.
   * @return Builder
   */
  public function show($lrsId, $id, $voided = false, $active = true) {
    return $this->query->where($lrsId, [
      ['statement.id', '=', $id],
      ['voided', '=', $voided],
      ['active', '=', $active]
    ]);
  }

  /**
   * Gets statements from the lrs (with the $lrsId) that match the $filters.
   * @param UUID $lrsId
   * @param [StatementFilter] $filters
   * @param [StatementFilter] $options
   * @return Builder
   */
  public function index($lrsId, array $filters, array $options) {
    $where = [];

    // Defaults filters.
    $filters = array_merge([
      'agent' => null,
      'activity' => null,
      'verb' => null,
      'registration' => null,
      'since' => null,
      'until' => null,
      'active' => true,
      'voided' => false
    ], $filters);

    // Defaults options.
    $options = array_merge([
      'related_activity' => false,
      'related_agents' => false,
      'ascending' => true,
      'format' => 'exact',
      'offset' => 0,
      'limit' => self::DEFAULT_LIMIT
    ], $options);

    // Filters by date.
    if (isset($filters['since'])) $where[] = ['statement.stored', '>', $filters['since']];
    if (isset($filters['until'])) $where[] = ['statement.stored', '<', $filters['until']];
    if (isset($filters['active'])) $where[] = ['active', '=', $filters['active']];
    if (isset($filters['voided'])) $where[] = ['voided', '=', $filters['voided']];
    $statements = $this->query->where($lrsId, $where);

    // Adds filters that don't have options.
    $statements = $this->addFilter($statements, $filters['verb'], [
      'statement.verb.id'
    ]);
    $statements = $this->addFilter($statements, $filters['registration'], [
      'statement.context.registration'
    ]);

    // Filters by activity.
    $statements = $this->addOptionFilter($statements, $filters['activity'], $options['related_activity'], [
      'statement.object.id'
    ], [
      'statement.context.contextActivities.parent.id',
      'statement.context.contextActivities.grouping.id',
      'statement.context.contextActivities.category.id',
      'statement.context.contextActivities.other.id'
    ]);

    // Filters by agent.
    $agent = $filters['agent'];
    $identifier = $this->getIdentifier($agent);
    $agent = isset($agent) && isset($agent[$identifier]) ? $agent[$identifier] : null;
    $statements = $this->addOptionFilter($statements, $agent, $options['related_agents'], [
      'statement.actor.'.$identifier,
      'statement.object.'.$identifier
    ], [
      'statement.authority.'.$identifier,
      'statement.context.instructor.'.$identifier,
      'statement.context.team.'.$identifier
    ]);

    // Uses ordering.
    if (isset($options['ascending']) && $options['ascending'] === true) {
      $statements = $statements->orderBy('statement.stored', 'ASC');
    } else {
      $statements = $statements->orderBy('statement.stored', 'DESC');
    }

    return $statements;
  }

  /**
   * Gets the identifier of the agent.
   * @param array $agent
   * @return string identifier (mbox, openid, account).
   */
  private function getIdentifier($agent) {
    if (isset($agent)) {
      if (isset($agent['mbox'])) return 'mbox';
      if (isset($agent['openid'])) return 'openid';
      if (isset($agent['account'])) return 'account';
    } else {
      return 'actor';
    }
  }

  /**
   * Returns $statements where the $value matches any of the $keys.
   * @param Builder $statements
   * @param mixed $value
   * @param array $keys
   * @return Builder
   */
  private function addFilter(Builder $statements, $value, array $keys) {
    if (!isset($value)) return $statements;

    // Adds keys for sub statement.
    foreach ($keys as $key) {
      $keys[] = 'statement.object.'.substr($key, 10);
    }

    return $this->orWhere($statements, $value, $keys);
  }

  /**
   * Filters $statements with an options.
   * @param Builder $statements Statements to be filtered.
   * @param mixed $value Value to match against $keys.
   * @param boolean $option
   * @param array $specific Keys to be search regardless of $option.
   * @param array $broad Addtional keys to be searched when $option is true.
   * @return Builder
   */
  private function addOptionFilter(Builder $statements, $value, $option, array $specific, array $broad) {
    $keys = $specific;

    if (isset($option) && $option === true) {
      $keys = array_merge($keys, $broad);
    }

    return $this->addFilter($statements, $value, $keys);
  }

  /**
   * Returns $statements where the $value matches any of the $keys.
   * @param Builder $statements
   * @param mixed $value
   * @param array $keys
   * @return Builder
   */
  private function orWhere(Builder $statements, $value, array $keys) {
    return $statements->where(function (Builder $query) use ($keys, $value) {
      foreach ($keys as $key) {
        $query->orWhere($key, $value);
      }
    });
  }

  /**
   * Converts statements in the "canonical" format as defined by the spec.
   * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements
   * @param [statements]
   * @return [statements]
   */
  public function toCanonical(array $statements, array $langs) {
    foreach ($statements as $index => $statement) {
      $statements[$index]['statement'] = $this->getStatementCanonical($statement['statement'], $langs);
    }
    return $statements;
  }

  /**
   * Converts statements in the "ids" format as defined by the spec.
   * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements
   * @param [statements]
   * @return [statements]
   */
  public function toIds(array $statements) {
    foreach ($statements as $index => $statement) {
      $statements[$index]['statement'] = $this->getStatementIds($statement['statement']);
    }
    return $statements;
  }

  /**
   * Attempts to convert a $langMap to a single string using a relevant language from $langs.
   * @param [LanguageMap] $langMap 
   * @param [Language] $langs
   * @return String/[LanguageMap]
   */
  private function canonicalise(array $langMap, array $langs) {
    foreach ($langs as $lang) {
      if (isset($langMap[$lang])) {
        return $langMap[$lang];
      }
    }
    return $langMap;
  }

  /**
   * Canonicalises some parts of the $statement as defined by the spec using $langs.
   * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements
   * @param Statement $statement
   * @param [Language] $langs
   * @return Statement
   */
  private function getStatementCanonical(array $statement, array $langs) {
    if (isset($statement['object']['definition']['name'])) {
      $statement['object']['definition']['name'] = $this->canonicalise(
        $statement['object']['definition']['name'],
        $langs
      );
    }
    if (isset($statement['object']['definition']['description'])) {
      $statement['object']['definition']['description'] = $this->canonicalise(
        $statement['object']['definition']['description'],
        $langs
      );
    }
    return $statement;
  }

  /**
   * Gets the identifier key of an $agent.
   * @param Agent $actor
   * @return string
   */
  private function getAgentIdentifier($actor) {
    if (isset($actor['mbox'])) return 'mbox';
    if (isset($actor['account'])) return 'account';
    if (isset($actor['openid'])) return 'openid';
    if (isset($actor['mbox_sha1sum'])) return 'mbox_sha1sum';
    return null;
  }

  /**
   * Ids some parts of the $statement as defined by the spec.
   * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements
   * @param Statement $statement
   * @return Statement
   */
  private function getStatementIds(array $statement) {
    $actor = $statement['actor'];
    
    // Processes an anonymous group or actor.
    if (isset($actor['objectType']) && $actor['objectType'] === 'Group' && $this->getAgentIdentifier($actor) === null) {
      $members = [];
      foreach ($actor['members'] as $member) {
        $identifier = $this->getAgentIdentifier($member);
        $members[] = [
          $identifier => $member[$identifier]
        ];
      }
      $actor['members'] = $members;
    } else {
      $identifier = $this->getAgentIdentifier($actor);
      $actor = [
        $identifier => $actor[$identifier],
        'objectType' => isset($actor['objectType']) ? $actor['objectType'] : 'Agent'
      ];
    }

    // Replace parts of the statements.
    $statement['actor'] = $actor;
    $identifier = $this->getAgentIdentifier($statement['object']) ?: 'id';
    $statement['object'] = [
      $identifier => $statement['object'][$identifier],
      'objectType' => isset($statement['object']['objectType']) ? $statement['object']['objectType'] : 'Activity'
    ];

    return $statement;
  }

  /**
   * Constructs the authority.
   * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#authority
   * @return Authority
   */
  private function constructAuthority() {
    $client = (new \Client)
      ->where('api.basic_key', \LockerRequest::getUser())
      ->where('api.basic_secret', \LockerRequest::getPassword())
      ->first();

    if ($client != null && isset($client['authority'])) {
      return $client['authority'];
    } else {
      $site = \Site::first();
      return [
        'name' => $site->name,
        'mbox' => 'mailto:' . $site->email,
        'objectType' => 'Agent'
      ];
    }
  }

  /**
   * Validates $statements.
   * @param [Statement] $statements
   * @return [Statement] Valid statements.
   */
  private function validateStatements(array $statements) {
    $authority = $this->constructAuthority();
    foreach ($statements as $index => $statement) {
      $validator = $this->validateStatement($statement, $authority);

      if ($validator['status'] == 'failed') {
        throw new \Exception(implode(', ', $validator['errors']));
      } else {
        $statements[$index] = $validator['statement'];
      }
    }
    return $statements;
  }

  /**
   * Create statements.
   * @param [Statement] $statements
   * @param Lrs $lrs
   * @return [Statement]
   */
  private function createStatements(array $statements, \Lrs $lrs) {
    return array_map(function (array $statement) use ($lrs) {
      $existingModel = $this->doesStatementIdExist($lrs->_id, $statement);
      if (!$existingModel) {
        $newModel = $this->makeStatement($statement, $lrs);
        $newModel->active = false;
        $newModel->voided = false;
        if ($newModel->save()) {
          return $newModel;
        } else {
          throw new \Exception('Failed to save.');
        }
      } else {
        return $existingModel;
      }
    }, $statements);
  }

  /**
   * Adds statement to refs in a existing referrer.
   * @param [Statement] $statements
   * @return [Statement]
   */
  private function updateReferrers(array $statements, \Lrs $lrs) {
    return array_map(function (Statement $statement) use ($lrs) {
      if ($statement->active === true) return $statement;

      // Finds all statements ($referrers) that refer to this $statement.
      $referrers = $this->query->where($lrs->_id, [
        ['statement.object.id', '=', $statement->statement['id']],
        ['statement.object.objectType', '=', 'StatementRef'],
        ['refs.id', '!=', $statement->statement['id']]
      ])->get();

      // Updates the refs $referrers.
      foreach ($referrers as $referrer) {
        $referrer->refs[] = $statement->statement;
        array_merge($referrer->refs, $statement->refs);
        if (!$referrer->save()) throw new \Exception('Failed to save referrer.');
      }

      return $statement;
    }, $statements);
  }

  /**
   * Adds existing statement to refs in a referrer.
   * @param [Statement] $statements
   * @return [Statement]
   */
  private function addReferences(array $statements, \Lrs $lrs) {
    return array_map(function (Statement $statement) use ($lrs) {
      if ($statement->active === true) return $statement;
      if (!$this->isReferencing($statement)) return $statement;

      // Finds the statement that it references.
      $reference = $this->query->where($lrs->_id, [
        ['statement.id', '=', $statement->statement['object']['id']],
        ['refs.id', '!=', $statement->statement['id']]
      ])->whereNotIn('statement.id', $statement->refs)->first();

      // Updates the refs.
      $statement->refs[] = $reference->statement;
      array_merge($statement->refs, $reference->refs);
      if (!$statement->save()) throw new \Exception('Failed to save statement reference.');

      return $statement;
    }, $statements);
  }

  private function isReferencing(Statement $statement) {
    return (
      isset($statement->statement['object']['id']) &&
      isset($statement->statement['object']['objectType']) &&
      $statement->statement['object']['objectType'] === 'StatementRef'
    );
  }

  /**
   * Determines if a $statement voids another.
   * @param Statement $statement
   * @return boolean
   */
  private function isVoiding(Statement $statement) {
    return (
      ($statement->statement['verb']['id'] !== 'http://adlnet.gov/expapi/verbs/voided') &&
      $this->isReferencing($statement)
    );
  }

  private function voidStatements(array $statements, \Lrs $lrs) {
    $unvoid = function (Statement $statement) use ($lrs) {
      if ($statement->active === true) return $statement;
      if (!$this->isVoiding($statement)) return $statement;

      // Toggles voided $statement.
      $reference = $this->query->where($lrs->_id, [
        ['statement.id', '=', $statement->statement['object']['id']],
        ['statement.object.objectType', '=', 'StatementRef']
      ])->first();
      $reference->voided = !$reference->voided;
      if (!$reference->save()) throw new \Exception('Failed to toggle voided statement.');
      $unvoid($reference);

      return $statement;
    };
    return array_map($unvoid, $statements);
  }

  private function activateStatements(array $statements) {
    return array_map(function (Statement $statement) {
      $statement->active = true;
      if (!$statement->save()) throw new \Exception('Failed to activate statement.');
      return $statement;
    }, $statements);
  }
  
  /**
   * Creates $statements in the $lrs with $attachments.
   * @param [Statement] $statements
   * @param \LRS $lrs
   * @param string $attachments
   * @return array create result (see makeCreateResult function)
   */
  public function create(array $statements, \Lrs $lrs, $attachments = '') {
    $statements = $this->validateStatements($statements);
    $statements = $this->createStatements($statements, $lrs);
    $statements = $this->updateReferrers($statements, $lrs);
    $statements = $this->addReferences($statements, $lrs);
    $statements = $this->voidStatements($statements, $lrs);
    $statements = $this->activateStatements($statements);

    // Stores the $attachments.
    if ($attachments != '') {
      $this->storeAttachments($attachments, $lrs->_id);
    }

    return array_map(function (Statement $statement) {
      return $statement->statement['id'];
    }, $statements);
  }

  /**
   * Validates a $statement with an $authority.
   * @param Statement $statement
   * @param Authority $Authority
   * @return Validator
   */
  private function validateStatement(array $statement, array $authority) {
    return (new \app\locker\statements\xAPIValidation())->runValidation(
      $statement,
      $authority
    );
  }

  /**
   * Makes a $statement for the current $lrs.
   * @param Statement $statement
   * @param LRS $lrs
   * @return Statement
   */
  private function makeStatement(array $statement, \Lrs $lrs) {
    // Uses defaults where possible.
    $statement = array_merge([
      'stored' => ($currentDate = $this->getCurrentDate()),
      'timestamp' => $currentDate
    ], $statement);
     
    // For now we store the latest submitted definition.
    // @todo this will change when we have a way to determine authority to edit.
    if( isset($statement['object']['definition'])){
      $this->activity->saveActivity(
        $statement['object']['id'],
        $statement['object']['definition']
      );
    }

    // Create a new statement model
    $newStatement = new Statement;
    $newStatement['lrs'] = [
      '_id' => $lrs->_id,
      'name' => $lrs->title
    ];
    $newStatement['statement'] = $this->replaceFullStop($statement);
    return $newStatement;
  }

  /**
   * Make an associative array that represents the result of creating statements.
   * @param [StatementId] $ids Array of IDs of successfully created statements.
   * @param boolean $success
   * @param string $description Description of the result.
   * @return array create result.
   */
  private function makeCreateResult(array $ids, $success = false, $description = '') {
    return [
      'success' => $success,
      'ids' => $ids,
      'message' => $description
    ];
  }

  /**
   * Calculates the current date(consistent through xAPI header).
   * @return string
   */
  public function getCurrentDate() {
    $current_date = \DateTime::createFromFormat('U.u', sprintf('%.4f', microtime(true)));
    $current_date->setTimezone(new \DateTimeZone(\Config::get('app.timezone')));
    return $current_date->format('Y-m-d\TH:i:s.uP');
  }

  /**
   * Replace `.` with `&46;` in keys of a $statement.
   * @param Statement $statement
   * @return Statement
   */
  private function replaceFullStop(array $statement){
    return \app\locker\helpers\Helpers::replaceFullStop($statement);
  }

  /**
   * Check to see if a submitted statementId already exist and if so
   * are the two statements idntical? If not, return true.
   *
   * @param uuid   $id
   * @param string $lrs
   * @return boolean
   *
   **/
  private function doesStatementIdExist($lrsId, array $statement) {
    $existingModel = $this->statement
      ->where('lrs._id', $lrsId)
      ->where('statement.id', $statement['id'])
      ->first();
    
    if ($existingModel) {
        $existingStatement = (array) $existingModel['statement'];
        unset($existingStatement['stored']);
        if (!isset($statement['timestamp'])) unset($existingStatement['timestamp']);
        array_multisort($existingStatement);
        array_multisort($statement);
        ksort($existingStatement);
        ksort($statement);
    
        if ($existingStatement == $statement) {
          return $existingModel;
        } else {
          \App::abort(409, 'Conflicts - `'.json_encode($statement).'` does not match `'.json_encode($existingStatement).'`.');
        }
    }

    return null;
  }

  /**
   * Store any attachments
   *
   **/
  private function storeAttachments( $attachments, $lrs ){

    foreach( $attachments as $a ){

      // Separate body contents from headers
      $a = ltrim($a, "\n");
      list($raw_headers, $body) = explode("\n\n", $a, 2);

      // Parse headers and separate so we can access
      $raw_headers = explode("\n", $raw_headers);
      $headers     = array();
      foreach ($raw_headers as $header) {
        list($name, $value) = explode(':', $header);
        $headers[strtolower($name)] = ltrim($value, ' '); 
      }

      //get the correct ext if valid
      $ext = array_search( $headers['content-type'], FileTypes::getMap() );
      if( $ext === false ){
        \App::abort(400, 'This file type cannot be supported');
      }

      $filename = str_random(12) . "." . $ext;
      
      //create directory if it doesn't exist
      if (!\File::exists(base_path().'/uploads/'.$lrs.'/attachments/' . $headers['x-experience-api-hash'] . '/')) {
        \File::makeDirectory(base_path().'/uploads/'.$lrs.'/attachments/' . $headers['x-experience-api-hash'] . '/', 0775, true);
      }

      $destinationPath = base_path().'/uploads/'.$lrs.'/attachments/' . $headers['x-experience-api-hash'] . '/';

      $filename = $destinationPath.$filename; 
      $file = fopen( $filename, 'wb'); //opens the file for writing with a BINARY (b) fla
      $size = fwrite( $file, $body ); //write the data to the file
      fclose( $file );

      if( $size === false ){
        \App::abort( 400, 'There was an issue saving the attachment');
      }
    }

  }

  /**
   * Count statements for any give lrs
   * @param string Lrs
   * @param array parameters Any parameters for filtering
   * @return count
   **/
  public function count( $lrs, $parameters=null ){
    $query = $this->statement->where('lrs._id', $lrs);
    if(!is_null($parameters)){
      $this->addParameters( $query, $parameters, true );
    }
    $count = $query->count();
    $query->remember(5);
    return $count;
  }

  public function grouped($id, $parameters){
    $type = isset($parameters['grouping']) ? strtolower($parameters['grouping']) : '';
    
    switch ($type) {
      case "time":
        $interval = isset($parameters['interval']) ? $parameters['interval'] : "day";
        $filters = isset($parameters['filters']) ? json_decode($parameters['filters'], true) : array();
        $filters['lrs._id'] = $id;
        $results = $this->query->timedGrouping( $filters, $interval );
        break;
    }

    return $results;
  }

  public function timeGrouping($query, $interval ){
    return $query;
  }

  public function actorGrouping($query){
    $query->aggregate(
      array('$match' => array()),
      array(
        '$group' => array(
          '_id' => 'statement.actor.mbox'
        )
      )
    );
    return $query;
  }
}
