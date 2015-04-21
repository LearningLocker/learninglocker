<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Exceptions as Exceptions;
use \Illuminate\Database\Eloquent\Model as Model;

interface VoiderInterface {
  public function voidStatements(array $statements, StoreOptions $opts);
}

class EloquentVoider extends EloquentLinker implements VoiderInterface {

  /**
   * Voids statements that need to be voided.
   * @param [\stdClass] $statements
   * @param StoreOptions $opts
   */
  public function voidStatements(array $statements, StoreOptions $opts) {
    return array_map(function (\stdClass $voider) use ($opts) {
      return $this->voidStatement($voider, $opts);
    }, $statements);
  }

  /**
   * Voids a statement if it needs to be voided.
   * @param \stdClass $voider
   * @param StoreOptions $opts
   */
  private function voidStatement(\stdClass $voider, StoreOptions $opts) {
    if (!$this->isVoiding($voider)) return;

    $voided = $this->getModel($voider->object->id, $opts);

    if ($voided !== null) {
      if ($this->isVoiding($this->formatModel($voided))) throw new Exceptions\Exception(trans(
        'xapi.errors.void_voider'
      ));

      $voided->voided = true;
      $voided->save();
    } else {
      throw new Exceptions\Exception(trans(
        'xapi.errors.void_null'
      ));
    }
  }

  /**
   * Determines if a statement is a voiding statement.
   * @param \stdClass $statement
   * @return Boolean
   */
  private function isVoiding(\stdClass $statement) {
    return (
      isset($statement->verb->id) &&
      $statement->verb->id === 'http://adlnet.gov/expapi/verbs/voided' &&
      $this->isReferencing($statement)
    );
  }
}
