<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Exceptions as Exceptions;
use \Locker\Helpers\Helpers as Helpers;

interface Inserter {
  public function insert(array $statements, StoreOptions $opts);
}

class EloquentInserter extends EloquentReader implements Inserter {

  /**
   * Inserts statements with the given options.
   * @param [\stdClass] $statements
   * @param StoreOptions $opts
   * @throws Exceptions\Conflict
   */
  public function insert(array $statements, StoreOptions $opts) {
    $models = array_map(function (\stdClass $statement) use ($opts) {
      $this->checkForConflict($statement, $opts);
      return $this->constructModel($statement, $opts);
    }, $statements);

    return $this->insertModels($models, $opts);
  }

  /**
   * Checks for a duplicate statement with the given options.
   * @param [\stdClass] $statements
   * @param StoreOptions $opts
   * @throws Exceptions\Conflict
   */
  private function checkForConflict(\stdClass $statement, StoreOptions $opts) {
    $duplicate = $this->where($opts)
      ->where('statement.id', $statement->id)
      ->where('active', true)
      ->first();

    if ($duplicate === null) return;
    $this->compareForConflict($statement, $this->formatModel($duplicate));
  }

  /**
   * Compares two statements.
   * Throws Exceptions\Conflict if the two statements match.
   * @param \stdClass $statement_x
   * @param \stdClass $statement_y
   * @throws Exceptions\Conflict
   */
  private function compareForConflict(\stdClass $statement_x, \stdClass $statement_y) {
    $matchable_x = $this->matchableStatement($statement_x);
    $matchable_y = $this->matchableStatement($statement_y);
    if ($matchable_x != $matchable_y) {
      $encoded_x = json_encode($statement_x);
      $encoded_y = json_encode($statement_y);
      throw new Exceptions\Conflict(
        "Conflicts\r\n`$encoded_x`\r\n`$encoded_y`."
      );
    };
  }

  /**
   * Decodes the encoded statement.
   * Removes properties not necessary for matching.
   * @param \stdClass $statement
   * @return \stdClass $statement
   */
  private function matchableStatement(\stdClass $statement) {
    $statement = json_decode(json_encode($statement));
    unset($statement->stored);
    unset($statement->authority);
    return $statement;
  }

  /**
   * Constructs a model from the given statement and options.
   * @param \stdClass $statement
   * @param StoreOptions $opts
   * @return [String => Mixed] $model
   */
  private function constructModel(\stdClass $statement, StoreOptions $opts) {
    return [
      'lrs' => ['_id' => $opts->getOpt('lrs_id')],
      'client_id' => $opts->getOpt('client')->_id,
      'statement' => Helpers::replaceFullStop(json_decode(json_encode($statement), true)),
      'active' => false,
      'voided' => false,
      'timestamp' => new \MongoDate(strtotime($statement->timestamp))
    ];
  }

  /**
   * Inserts models with the given options.
   * @param [[String => Mixed]] $models
   * @param StoreOptions $opts
   */
  private function insertModels(array $models, StoreOptions $opts) {
    return $this->where($opts)->insert($models);
  }
}
