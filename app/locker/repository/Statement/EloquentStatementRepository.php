<?php namespace Locker\Repository\Statement;

use \DateTime;
use \Statement;
use \Locker\Repository\Activity\ActivityRepository as Activity;
use \Locker\Repository\Query\QueryRepository as Query;
use \Locker\Repository\Document\FileTypes;
use \Illuminate\Database\Eloquent\Builder as Builder;
use \Locker\Helpers\Exceptions as Exceptions;
use \Locker\Helpers\Helpers as Helpers;

class EloquentStatementRepository implements StatementRepository {

  // Defines properties to be set to construtor parameters.
  protected $statement, $activity, $query;
  protected $sent_ids = array();

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
      'related_activities' => false,
      'related_agents' => false,
      'ascending' => false,
      'format' => 'exact',
      'offset' => 0,
      'limit' => self::DEFAULT_LIMIT
    ], $options);

    // Checks params.
    if ($options['offset'] < 0) throw new Exceptions\Exception('`offset` must be a positive interger.');
    if ($options['limit'] < 0) throw new Exceptions\Exception('`limit` must be a positive interger.');
    if (!in_array($options['format'], ['ids', 'exact', 'canonical'])) {
      throw new Exceptions\Exception('`format` must be `ids`, `exact` or `canonical`.');
    }

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
    $statements = $this->addOptionFilter($statements, $filters['activity'], $options['related_activities'], [
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
    if (isset($agent) && !is_array($agent)) throw new Exceptions\Exception('Invalid agent');
    $agent = isset($agent) && isset($agent[$identifier]) ? $agent[$identifier] : null;

    // Fixes https://github.com/LearningLocker/learninglocker/issues/519.
    if ($identifier === 'account') {
      $statements = $this->addOptionFilter($statements, $agent['name'], $options['related_agents'], [
        'statement.actor.'.$identifier.'.name',
        'statement.object.'.$identifier.'.name'
      ], [
        'statement.authority.'.$identifier.'.name',
        'statement.context.instructor.'.$identifier.'.name',
        'statement.context.team.'.$identifier.'.name'
      ]);
      $statements = $this->addOptionFilter($statements, $agent['homePage'], $options['related_agents'], [
        'statement.actor.'.$identifier.'.homePage',
        'statement.object.'.$identifier.'.homePage'
      ], [
        'statement.authority.'.$identifier.'.homePage',
        'statement.context.instructor.'.$identifier.'.homePage',
        'statement.context.team.'.$identifier.'.homePage'
      ]);
    } else {
      $statements = $this->addOptionFilter($statements, $agent, $options['related_agents'], [
        'statement.actor.'.$identifier,
        'statement.object.'.$identifier
      ], [
        'statement.authority.'.$identifier,
        'statement.context.instructor.'.$identifier,
        'statement.context.team.'.$identifier
      ]);
    }

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
      if (isset($agent['mbox_sha1sum'])) return 'mbox_sha1sum';
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

    // Adds keys for sub statement and statement references.
    foreach ($keys as $key) {
      $keys[] = 'refs.'.substr($key, 10);
    }

    return $this->orWhere($statements, $value, $keys);
  }

  /**
   * Filters $statements with an options.
   * @param Builder $statements Statements to be filtered.
   * @param mixed $value Value to match against $keys.
   * @param boolean $use_broad
   * @param array $specific Keys to be search regardless of $use_broad.
   * @param array $broad Addtional keys to be searched when $use_broad is true.
   * @return Builder
   */
  private function addOptionFilter(Builder $statements, $value, $use_broad, array $specific, array $broad) {
    $keys = $specific;

    if ($use_broad === true) {
      $keys = array_merge($keys, $broad);

      // Adds keys for sub statement.
      foreach ($keys as $key) {
        $keys[] = 'statement.object.'.substr($key, 10);
      }
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
      return $query;
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

  /**
   * Validates $statements.
   * @param [Statement] $statements
   * @return [Statement] Valid statements.
   */
  private function validateStatements(array $statements, \Lrs $lrs) {
    $statements = $this->removeDuplicateStatements($statements, $lrs);
    $authority = $this->constructAuthority();
    $void_statements = [];

    foreach ($statements as $index => $statement) {
      $statement->setProp('authority', $authority);
      $errors = array_map(function ($error) {
        return (string) $error->addTrace('statement');
      }, $statement->validate());

      if (!empty($errors)) {
        throw new Exceptions\Validation($errors);
      } else {
        if ($this->isVoiding($statement->getValue())) {
          $void_statements[] = $statement->getPropValue('object.id');
        }
      }
    }
    if ($void_statements) {
      $this->validateVoid($statements, $lrs, $void_statements);
    }
    return $statements;
  }

  /**
   * Check that all void reference ids exist in the database and are not themselves void statements
   * @param array $statements
   * @param Lrs $lrs
   * @param array $references
   * @throws \Exception
   */
  private function validateVoid(array $statements, \Lrs $lrs, array $references) {
    $count = count($references);
    $reference_count = $this->statement
      ->where('lrs._id', $lrs->_id)
      ->whereIn('statement.id', $references)
      ->where('statement.verb.id', '<>', "http://adlnet.gov/expapi/verbs/voided")
      ->count();
    if ($reference_count != $count) {
      throw new Exceptions\Exception('Voiding invalid or nonexistant statement');
    }
  }

  /**
   * Remove duplicate statements and generate ids
   *
   * @param array $statements
   * @param \Lrs $lrs
   * @return array
   */
  private function removeDuplicateStatements(array $statements, \Lrs $lrs) {
    $new_id_count = 0;
    $new_statements = [];
    $indexed_statements = [];
    foreach($statements as $index => $statement) {
      $statement_id = $statement->getPropValue('id');
      if ($statement_id !== null) {
        if (isset($this->sent_ids[$statement_id])) {
          $sent_statement = json_encode($this->sent_ids[$statement_id]);
          $current_statement = json_encode($statement);
          $this->checkMatch($new_statement, $current_statement);
          unset($statements[$index]);
        } else {
          $this->sent_ids[$statement_id] = $statement;
          $indexed_statements[$statement_id] = $statement;
        }
      } else {
        $new_statements[] = $statement;
      }
    }

    if (count($new_statements)) {
      $new_statements = $this->assignIds($new_statements, $lrs);
      $indexed_statements = array_merge($indexed_statements, $new_statements);
    }

    return $indexed_statements;
  }

  /**
   * @param array $statements
   * @param \Lrs $lrs
   * @return array List of statements with assigned id
   */
  private function assignIds(array $statements, \Lrs $lrs) {
    $indexed_statements = [];
    $count = count($statements);
    $uuids = $this->generateIds($count + 1);
    $duplicates = $this->checkIdsExist($uuids, $lrs);
    if ($duplicates) {
      $uuids = array_diff($uuids, $duplicates);
    }
    while(count($uuids) < $count) {
      $new_uuids = $this->generateIds($count - count($uuids));
      $duplicates = $this->checkIdsExist($new_uuids, $lrs);
      if ($duplicates) {
        $new_uuids = array_diff($uuids, $duplicates);
        $uuids = array_merge($new_uuids);
      }
    }

    foreach($statements as $statement) {
      $uuid = array_pop($uuids);
      $statement->setProp('id', $uuid);
      $indexed_statements[$uuid] = $statement;
    }
    return $indexed_statements;
  }

  private function checkMatch($new_statement, $old_statement) {
    $new_statement_obj = \Locker\XApi\Statement::createFromJson($new_statement);
    $old_statement_obj = \Locker\XApi\Statement::createFromJson($old_statement);
    $new_statement = json_decode($new_statement_obj->toJson(), true);
    $old_statement = json_decode($old_statement_obj->toJson(), true);
    array_multisort($new_statement);
    array_multisort($old_statement);
    ksort($new_statement);
    ksort($old_statement);
    unset($new_statement['stored']);
    unset($old_statement['stored']);
    if ($new_statement !== $old_statement) {
      $new_statement = $new_statement_obj->toJson();
      $old_statement = $old_statement_obj->toJson();
      throw new Exceptions\Conflict(
        "Conflicts\r\n`$new_statement`\r\n`$old_statement`."
      );
    };
  }

  /**
   * Check lrs for list of statement ids, optional list of statements by id for comparison
   *
   * @param array $uuids
   * @param \Lrs $lrs
   * @param array $statements
   * @return array List of duplicate ids
   */
  private function checkIdsExist(array $uuids, \Lrs $lrs, array $statements=null) {
    $duplicates = array();

    if ($uuids) {
      $existingModels = $this->statement
        ->where('lrs._id', $lrs->_id)
        ->whereIn('statement.id', $uuids)
        ->get();

      if(!$existingModels->isEmpty()) {
        foreach($existingModels as $existingModel) {
          $existingStatement = $existingModel->statement;
          $id = $existingStatement['id'];
          $duplicates[] = $id;
          if ($statements && isset($statements[$id])) {
            $statement = $statements[$id];
            $this->checkMatch($statement->toJson(), json_encode($existingStatement));
          }
        }
      }
    }
    return $duplicates;
  }

  /**
   * Generate an array of uuids of size $count
   *
   * @param integer $count
   * @return array List of uuids
   */
  private function generateIds($count) {
    $uuids = array();
    $validator = new \app\locker\statements\xAPIValidation();
    $i = 1;
    while ($i <= $count) {
      $uuid = $validator->makeUUID();
      if (isset($this->sent_ids[$uuid])) {
        continue;
      }
      $i++;
      $uuids[] = $uuid;
    }

    return $uuids;
  }

  /**
   * Create statements.
   * @param [Statement] $statements
   * @param Lrs $lrs
   * @return array list of statements
   */
  private function createStatements(array $statements, \Lrs $lrs) {
    if (count($this->sent_ids)) {
      // check for duplicates from statements with pre-assigned ids
      $this->checkIdsExist(array_keys($this->sent_ids), $lrs, $statements);
    }

    // Replaces '.' in keys with '&46;'.
    $statements = array_map(function (\Locker\XApi\Statement $statement) use ($lrs) {
      $replaceFullStop = function ($object, $replaceFullStop) {
        if ($object instanceof \Locker\XApi\Element) {
          $prop_keys = array_keys(get_object_vars($object->getValue()));
          foreach ($prop_keys as $prop_key) {
            $new_prop_key = str_replace('.', '&46;', $prop_key);
            $prop_value = $object->getProp($prop_key);
            $new_value = $replaceFullStop($prop_value, $replaceFullStop);
            $object->unsetProp($prop_key);
            $object->setProp($new_prop_key, $new_value);
          }
          return $object;
        } else {
          return $object;
        }
      };
      $replaceFullStop($statement, $replaceFullStop);

      return $this->makeStatement($statement, $lrs);
    }, $statements);

    $this->statement->where('lrs._id', $lrs->id)->insert(array_values($statements));
    return $statements;
  }

  /**
   * Sets references
   * @param array $statements
   * @param \Lrs $lrs
   * @return array list of statements with references
   */
  public function updateReferences(array $statements, \Lrs $lrs) {
    foreach($statements as $id => $statement) {
      if ($this->isReferencing($statement['statement'])) {
        // Finds the statement that it references.
        $refs = [];
        $this->recursiveCheckReferences($statements, $lrs, $refs, $statement['statement']->object->id);
        // Updates the refs.
        if ($refs) {
          $refs = array_values($refs);
          $statements[$id]['refs'] = $refs;
          $this->statement
            ->where('lrs._id', $lrs->id)
            ->where('statement.id', $id)->update([
              'refs' => $refs
            ]);
        }
      }
    }
    $this->updateReferrers($statements, $lrs);
    return $statements;
  }

  private function recursiveCheckReferences(array $statements, \Lrs $lrs, array &$refs, $id) {
    // check if $id refers to a statement being inserted
    if (isset($refs[$id])) {
      return $refs;
    }

    if (isset($statements[$id])) {
      $s = $statements[$id];
      $refs[$id] = $s->statement;
      if ($this->isReferencing($s->statement)) {
        $s_id = $s->statement->getPropValue('object.id');
        $this->recursiveCheckReferences($statements, $lrs, $refs, $s_id);
      }
    } else {
      $reference = $this->query->where($lrs->_id, [
        ['statement.id', '=', $id]
      ])->first();
      if ($reference) {
        $refs[$id] = $reference->statement;
        if ($this->isReferencing((object) $reference->statement)) {
          $s_id = $reference->statement['object']['id'];
          $this->recursiveCheckReferences($statements, $lrs, $refs, $s_id);
        }
      }
    }
    return $refs;
  }

  /**
   * Adds statement to refs in a existing referrer.
   * @param [Statement] $statements
   * @return [Statement]
   */
  private function updateReferrers(array $statements, \Lrs $lrs) {
    if (count($this->sent_ids)) {
      $referrers = $this->query->where($lrs->_id, [
          ['statement.object.id', 'in', array_keys($statements)],
          ['statement.object.objectType', '=', 'StatementRef'],
      ])->get();

      // Updates the refs $referrers.
      foreach ($referrers as $referrer) {
        $statement_id = $referrer['statement']['object']['id'];
        $statement = $statements[$statement_id];
        if (isset($statement['refs'])) {
          $referrer->refs = array_merge([$statement['statement']], $statement['refs']);
        } else {
          $referrer->refs = [$statement['statement']];
        }
        if (!$referrer->save()) throw new Exceptions\Exception('Failed to save referrer.');
      }
    }
    return $statements;
  }

  private function isReferencing(\stdClass $statement) {
    return (
      isset($statement->object->id) &&
      isset($statement->object->objectType) &&
      $statement->object->objectType === 'StatementRef'
    );
  }

  /**
   * Determines if a $statement voids another.
   * @param Statement $statement
   * @return boolean
   */
  private function isVoiding(\stdClass $statement) {
    if (($statement->verb->id === 'http://adlnet.gov/expapi/verbs/voided') && $this->isReferencing($statement)) {
      return true;
    }
    return false;
  }

  private function voidStatement($statement, $lrs) {
    if (!$this->isVoiding($statement['statement'])) return $statement;
    $reference = $this->query->where($lrs->_id, [
        ['statement.id', '=', $statement['statement']->object->id]
    ])->first();
    $ref_statement = json_decode(json_encode($reference->statement));
    if ($this->isVoiding($ref_statement)) {
       throw new Exceptions\Exception('Cannot void a voiding statement');
    }
    $reference->voided = true;
    if (!$reference->save()) throw new Exceptions\Exception('Failed to void statement.');
    return $statement;
  }

  public function voidStatements(array $statements, \Lrs $lrs) {
    return array_map(function (array $statement) use ($lrs) {
      return $this->voidStatement($statement, $lrs);
    }, $statements);
  }

  public function activateStatements(array $statements, \Lrs $lrs) {
    $updated = $this->statement->where('lrs._id', $lrs->id)->whereIn('statement.id', array_keys($statements))->update(array('active' => true));
  }

  /**
   * Creates $statements in the $lrs with $attachments.
   * @param [Statement] $statements
   * @param \LRS $lrs
   * @param string $attachments
   * @return array create result (see makeCreateResult function)
   */
  public function create(array $statements, \Lrs $lrs, $attachments = '') {
    $statements = array_map(function (\stdClass $statement) {
      return new \Locker\XApi\Statement($statement);
    }, $statements);
    $statements = $this->validateStatements($statements, $lrs);
    $statements = $this->createStatements($statements, $lrs);
    $statements = $this->updateReferences($statements, $lrs);
    $statements = $this->voidStatements($statements, $lrs);
    $this->activateStatements($statements, $lrs);

    // Stores the $attachments.
    if ($attachments != '') {
      $this->storeAttachments($attachments, $lrs->_id);
    }
    return array_keys($statements);
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
  private function makeStatement(\Locker\XApi\Statement $statement, \Lrs $lrs) {
    // Uses defaults where possible.
    $currentDate = $this->getCurrentDate();
    $statement->setProp('stored', $currentDate);
    if ($statement->getPropValue('timestamp') === null) {
      $statement->setProp('timestamp', $currentDate);
    }

    // For now we store the latest submitted definition.
    // @todo this will change when we have a way to determine authority to edit.
    if ($statement->getPropValue('object.definition') !== null) {
      $this->activity->saveActivity(
        $statement->getPropValue('object.id'),
        $statement->getPropValue('object.definition')
      );
    }
    // Create a new statement model
    return [
      'lrs' => [
        '_id' => $lrs->_id,
        'name' => $lrs->title
      ],
      'statement' => $statement->getValue(),
      'active' => false,
      'voided' => false,
      'timestamp' => new \MongoDate(strtotime($statement->getPropValue('timestamp')))
    ];
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
    return \Locker\Helpers\Helpers::replaceFullStop($statement);
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
      $existingStatement = json_encode($existingModel->statement);
      $this->checkMatch($existingStatement, json_encode($statement));
      return $existingModel;
    }

    return null;
  }

  /**
   * Store any attachments
   *
   **/
  private function storeAttachments( $attachments, $lrs ){

    foreach( $attachments as $attachment ){
      // Determines the delimiter.
      $delim = "\n";
      if (strpos($attachment, "\r".$delim) !== false) $delim = "\r".$delim;

      // Separate body contents from headers
      $attachment = ltrim($attachment, $delim);
      list($raw_headers, $body) = explode($delim.$delim, $attachment, 2);

      // Parse headers and separate so we can access
      $raw_headers = explode($delim, $raw_headers);
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
      if (!\File::exists(Helpers::getEnvVar('LOCAL_FILESTORE').'/'.$lrs.'/attachments/' . $headers['x-experience-api-hash'] . '/')) {
        \File::makeDirectory(Helpers::getEnvVar('LOCAL_FILESTORE').'/'.$lrs.'/attachments/' . $headers['x-experience-api-hash'] . '/', 0775, true);
      }

      $destinationPath = Helpers::getEnvVar('LOCAL_FILESTORE').'/'.$lrs.'/attachments/' . $headers['x-experience-api-hash'] . '/';

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
