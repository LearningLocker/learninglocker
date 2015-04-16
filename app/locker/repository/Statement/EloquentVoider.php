<?php namespace Locker\Repository\Statement;

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

    $voided = $this->where($opts)
      ->where('statement.id', $voider->object->id)
      ->first();

    if ($voided !== null) {
      if ($this->isVoidinging($voided->statement)) throw new \Exception(trans(
        'xapi.errors.void_voider'
      ));

      $voided->voided = true;
      $voided->save();
    } else {
      throw new \Exception(trans(
        'xapi.errors.void_null'
      ));
    }
  }

  /**
   * Determines if a statement is a voiding statement.
   * @param \stdClass $voider
   * @return Boolean
   */
  private function isVoiding(\stdClass $voider) {
    return (
      isset($voider->object->id) &&
      $voider->object->id === 'http://adlnet.gov/expapi/verbs/voided' &&
      $this->isReferencing($statement)
    );
  }
}
