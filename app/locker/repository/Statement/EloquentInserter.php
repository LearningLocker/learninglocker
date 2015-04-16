<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Exceptions as Exceptions;

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
      ->first();

    if ($duplicate === null) return;
    $duplicate =json_decode(json_encode($duplicate->statement));
    $this->compareForConflict($statement, $duplicate);
  }

  /**
   * Compares two statements.
   * Throws Exceptions\Conflict if the two statements match.
   * @param \stdClass $statement_x
   * @param \stdClass $statement_y
   * @throws Exceptions\Conflict
   */
  private function compareForConflict(\stdClass $statement_x, \stdClass $statement_y) {
    $encoded_x = json_encode($statement_x);
    $encoded_y = json_encode($statement_y);
    $decoded_x = $this->decodeStatementMatch($encoded_x);
    $decoded_y = $this->decodeStatementMatch($encoded_y);
    if ($decoded_x !== $decoded_y) {
      throw new Exceptions\Conflict(
        "Conflicts\r\n`$encoded_x`\r\n`$encoded_y`."
      );
    };
  }

  /**
   * Decodes the encoded statement.
   * Removes properties not necessary for matching.
   * @param String $encoded_statement
   * @return [String => Mixed] $decoded_statement
   */
  private function decodeStatementMatch($encoded_statement) {
    $decoded_statement = json_decode($encoded_x, true);
    array_multisort($decoded_statement);
    ksort($decoded_statement);
    unset($decoded_statement['stored']);
    unset($decoded_statement['authority']);
    return $decoded_statement;
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
      'statement' => $statement,
      'active' => false,
      'voided' => false,
      'timestamp' => new MongoDate(strtotime($statement->timestamp))
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
