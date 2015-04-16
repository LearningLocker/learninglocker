<?php namespace Locker\Repository\Statement;

use \Illuminate\Database\Eloquent\Model as Model;

interface LinkerInterface {
  public function updateReferences(array $statements, StoreOptions $opts);
}

class EloquentLinker extends EloquentReader implements LinkerInterface {

  private $to_update = [];
  private $downed = [];

  /**
   * Updates statement references.
   * @param [\stdClass] $statements
   * @param StoreOptions $opts
   */
  public function updateReferences(array $statements, StoreOptions $opts) {
    $this->to_update = array_map(function (\stdClass $statement) use ($opts) {
      return $this->getModel($statement, $opts);
    }, $statements);

    while (count($this->to_update) > 0) {
      $this->upLink($this->to_update[0], [], $opts);
    }
  }

  /**
   * Determines if a statement is a referencing statement.
   * @param \stdClass $statement
   * @return Boolean
   */
  private function isReferencing(Model $statement) {
    return (
      isset($model->statement->object->objectType) &&
      $model->statement->object->objectType === 'StatementRef'
    );
  }

  /**
   * Gets the statement as an associative array from the database.
   * @param \stdClass $statement
   * @param StoreOptions $opts
   * @return [Model]
   */
  private function getModel(\stdClass $statement, StoreOptions $opts) {
    $statement_id = $statement->id;
    $model = $this->where($opts)
      ->where('statement.id', $statement_id)
      ->first();
    return $model;
  }

  /**
   * Goes up the reference chain until it reaches the top then goes down setting references.
   * @param Model $model
   * @param [String] $visited IDs of statements visisted in the current chain (avoids infinite loop).
   * @param StoreOptions $opts
   * @return [Model]
   */
  private function upLink(Model $model, array $visited, StoreOptions $opts) {
    if (in_array($model->statement->id, $visited)) return [];
    $visited[] = $model->statement->id;
    $up_refs = $this->upRefs($model, $opts);
    if ($up_refs->count() > 0) {
      return $up_refs->map(function ($up_ref) use ($opts, $visited) {
        if (in_array($up_ref, $this->downed)) return;
        $this->downed = array_merge($this->downed, $this->upLink($up_ref, $visited, $opts));
      })->values();
    } else {
      return $this->downLink($model, [], $opts);
    }
  }

  /**
   * Goes down the reference chain setting references (refs).
   * @param Model $model
   * @param [String] $visited IDs of statements visisted in the current chain (avoids infinite loop).
   * @param StoreOptions $opts
   * @return [Model]
   */
  private function downLink(Model $model, array $visited, StoreOptions $opts) {
    if (in_array($model, $visited)) {
      return array_slice($visited, array_search($model, $visited));
    }
    $visited[] = $model;
    $down_ref = $this->downRef($model, $opts);
    if ($down_ref !== null) {
      $refs = $this->downLink($down_ref, $visited, $opts);
      $this->setRefs($model, $refs, $opts);
      $this->unQueue($model);
      return array_merge([$model], $refs);
    } else {
      $this->unQueue($model);
      return [$model];
    }
  }

  /**
   * Gets the statements referencing the given statement.
   * @param Model $model
   * @param StoreOptions $opts
   * @return [Model]
   */
  private function upRefs(Model $model, StoreOptions $opts) {
    return $this->where($opts)
      ->where('statement.object.id', $model->statement->id)
      ->where('statement.object.objectType', 'StatementRef')
      ->get();
  }

  /**
   * Gets the statement referred to by the given statement.
   * @param Model $model
   * @param StoreOptions $opts
   * @return Model
   */
  private function downRef(Model $model, StoreOptions $opts) {
    if (!$this->isReferencing($model)) return null;
    return $this->where($opts)
      ->where('statement.id', $model->statement->object->id)
      ->first();
  }

  /**
   * Updates the refs for the given statement.
   * @param Model $model
   * @param [[String => mixed]] $refs Statements that are referenced by the given statement.
   * @param StoreOptions $opts
   */
  private function setRefs(Model $model, array $refs) {
    $model->refs = array_map(function ($ref) {
      return $ref->statement;
    }, $refs);
    $model->save();
  }

  /**
   * Unqueues the statement so that it doesn't get relinked.
   * @param Model $model
   */
  private function unQueue(Model $model) {
    $updated_index = array_search($model, $this->to_update);
    if ($updated_index !== false) {
      array_splice($this->to_update, $updated_index, 1);
    }
  }
}
