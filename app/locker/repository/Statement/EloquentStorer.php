<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Helpers as Helpers;
use \Locker\XApi\Statement as XAPIStatement;
use \Locker\Helpers\Exceptions as Exceptions;

interface Storer {
  public function store(array $statements, array $attachments, StoreOptions $opts);
}

class EloquentStorer extends EloquentReader implements Storer {

  protected $inserter, $linker, $voider, $attacher, $hashes;

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
    $scopes = $opts->getOpt('scopes');
    if (!(in_array('all', $scopes) || in_array('statements/write', $scopes))) {
      throw new Exceptions\Exception('Unauthorized request.', 401);
    }

    $id_statements = $this->constructValidStatements($statements, $opts);
    $ids = array_keys($id_statements);
    $statements = array_values($id_statements);

    $this->inserter->insert($statements, $opts);
    $this->linker->updateReferences($statements, $opts);
    $this->voider->voidStatements($statements, $opts);
    $this->attacher->store($attachments, $this->hashes, $opts);
    $this->activateStatements($ids, $opts);

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
    $this->hashes = [];

    foreach ($statements as $statement) {
      $statement->authority = $opts->getOpt('authority');
      $statement->stored = Helpers::getCurrentDate();

      if (!isset($statement->timestamp)) {
        $statement->timestamp = $statement->stored;
      }

      if (!isset($statement->id)) {
        $statement->id = $this->getUUID();
      }

      // Validates statement.
      $constructed_statement = new XAPIStatement($statement);
      Helpers::validateAtom($constructed_statement, 'statement');
      $statement = $constructed_statement->getValue();

      // Gets attachment hashes.
      $attachments = !isset($statement->attachments) ? [] : $statement->attachments;
      foreach ($attachments as $attachment) {
        $this->hashes[] = $attachment->sha2;
      }

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

  /**
   * Generates a UUID.
   * @return String
   */
  private function getUUID() {
    $remote_addr = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'LL';
    mt_srand(crc32(serialize([microtime(true), $remote_addr, 'ETC'])));

    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
      mt_rand(0, 0xffff), mt_rand(0, 0xffff),
      mt_rand(0, 0xffff),
      mt_rand(0, 0x0fff) | 0x4000,
      mt_rand(0, 0x3fff) | 0x8000,
      mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
  }
}
