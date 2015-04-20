<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Helpers as Helpers;
use \Locker\XApi\Statement as XAPIStatement;

interface Storer {
  public function store(array $statements, array $attachments, StoreOptions $opts);
}

class EloquentStorer extends EloquentReader implements Storer {

  protected $inserter, $linker, $voider, $attacher;

  public function __construct() {
    $this->inserter = new EloquentInserter();
    $this->linker = new EloquentLinker();
    $this->voider = new EloquentVoider();
    $this->attacher = new FileAttacher();
  }

  /**
   * Stores statements and attachments with the given options
   * @param [\stdClass] $statements
   * @param [String => Mixed] $attachments
   * @param StoreOptions $opts
   * @return [String] UUIDs of the statements stored.
   */
  public function store(array $statements, array $attachments, StoreOptions $opts) {
    $id_statements = $this->constructValidStatements($statements, $opts);
    $ids = array_keys($statements);
    $statements = array_values($id_statements);

    $this->inserter->insert($statements, $opts);
    $this->linker->updateReferences($statements, $opts);
    $this->voider->voidStatements($statements, $opts);

    $this->activateStatements($ids, $opts);
    $this->attacher->store($attachments, $opts);

    return $ids;
  }

  /**
   * Constructs valid statements.
   * @param [\stdClass] $statements
   * @param StoreOptions $opts
   * @return [String => \stdClass] Array of statements mapped to their UUIDs.
   */
  private function constructValidStatements(array $statements, StoreOptions $opts) {
    $constructed = [];

    foreach ($statements as $statement) {
      $statement->authority = $opts->getOpt('authority');
      $statement->stored = Helpers::getCurrentDate();

      if (!isset($statement->timestamp)) {
        $statement->timestamp = $statement->stored;
      }

      if (!isset($statement->id)) {
        $statement->id = Helpers::makeUUID();
      }

      // Validates statement.
      $constructed_statement = new XAPIStatement($statement);
      Helpers::validateAtom($constructed_statement, 'statement');
      $statement = $constructed_statement->getValue();

      // Adds $statement to $constructed.
      if (isset($constructed[$statement->id])) {
        $this->inserter->compareForConflict($statement, $constructed[$statement->id]);
      } else {
        $constructed[$statement->id] = $statement;
      }
    }

    return $constructed;
  }

  /**
   * Activates the statements using their UUIDs.
   * @param [String] $ids UUIDs of the statements to be activated.
   * @param StoreOptions $opts
   */
  private function activateStatements(array $ids, StoreOptions $opts) {
    return $this->where($opts)
      ->whereIn('statement.id', $ids)
      ->update(['active' => true]);
  }
}
