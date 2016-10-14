<?php namespace Locker\Repository\Statement;

use \Illuminate\Database\Eloquent\Model as Model;
use \Illuminate\Database\Eloquent\Collection as Collection;
use \Locker\Helpers\Helpers as Helpers;
use Carbon\Carbon as Carbon;
use MongoDate;

interface LinkerInterface {
  public function updateReferences(array $statements, StoreOptions $opts);
}

class EloquentLinker extends EloquentReader implements LinkerInterface {

  private $upRefStatements = [];
  private $to_update = [];
  private $downed = null;

  /**
   * Updates statement references.
   * @param [\stdClass] $statements
   * @param StoreOptions $opts
   */
  public function updateReferences(array $statements, StoreOptions $opts) {
    $this->voider = strpos(json_encode($statements), 'voided') !== false;
    $this->downed = new Collection();
    $this->to_update = $this->getModels($statements, $opts);

    $statement_ids = array_map(function ($statement) {
      return $statement->id;
    }, $statements);

    $this->upRefStatements = $this->eagerLoadUpRefs($statement_ids, $opts);

    while (count($this->to_update) > 0) {
      $this->upLink($this->to_update[0], [], $opts, true);
    }
  }

  /**
   * Gets the statements referencing the given statement ids.
   * @param [string] $statement_ids
   * @param StoreOptions $opts
   * @return [\stdClass]
   */
  private function eagerLoadUpRefs(array $statement_ids, StoreOptions $opts) {
    $models = $this->where($opts)
      ->whereIn('statement.object.id', $statement_ids)
      ->where('statement.object.objectType', 'StatementRef')
      ->get();

    $collatedStatements = [];
    foreach( $models as $model) {
      $objectId = $model->statement['object']['id'];
      if (!isset($collatedStatements[$objectId])) {
        $collatedStatements[$objectId] = new Collection;
      }
      $collatedStatements[$objectId]->push($model);
    }
    return $collatedStatements;
  }

  /**
   * Determines if a statement is a referencing statement.
   * @param \stdClass $statement
   * @return Boolean
   */
  protected function isReferencing(\stdClass $statement) {
    return (
      isset($statement->object->objectType) &&
      $statement->object->objectType === 'StatementRef'
    );
  }

  /**
   * Gets the statements as an array from the database.
   * @param [\stdClass] $statements Statements
   * @param StoreOptions $opts
   * @return [Model]
   */
  protected function getModels($statements, StoreOptions $opts) {
    $statement_ids = array_map(function (\stdClass $statement) use ($opts) {
      return $statement->id;
    }, $statements);

    $models = $this->where($opts)
      ->whereIn('statement.id', $statement_ids)
      ->get();

    return $models->all();
  }

  /**
   * Gets the statement as an associative array from the database.
   * @param String $statement_id Statement's UUID.
   * @param StoreOptions $opts
   * @return [Model]
   */
  protected function getModel($statement_id, StoreOptions $opts) {
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
  private function upLink(Model $model, array $visited, StoreOptions $opts, $useInitialUpRefs = false) {
    $statement = $this->formatModel($model);
    if (in_array($statement->id, $visited)) return [];
    $visited[] = $statement->id;

    $up_refs = $this->upRefs($statement, $opts, $useInitialUpRefs);
    if ($up_refs->count() > 0) {
      return $up_refs->each(function ($up_ref) use ($opts, $visited) {
        if ($this->downed->has($up_ref->_id)) return;
        $this->downed->merge($this->upLink($up_ref, $visited, $opts));
        return $up_ref;
      })->values();
    } else {
      return $this->downLink($model, [], $opts);
    }
  }

  /**
   * Gets the statements referencing the given statement.
   * @param \stdClass $statement
   * @param StoreOptions $opts
   * @param boolean $useInitialUpRefs
   * @return [\stdClass]
   */
  private function upRefs(\stdClass $statement, StoreOptions $opts, $useInitialUpRefs) {
    if ($useInitialUpRefs) {
      if (isset($this->upRefStatements[$statement->id])) {
        return $this->upRefStatements[$statement->id];
      }
      return new Collection;
    }

    return $this->fetchUpRefs($statement, $opts);
  }

  /**
   * Gets the statements referencing the given statement from the database
   * @param \stdClass $statement
   * @param StoreOptions $opts
   * @return [\stdClass]
   */
  private function fetchUpRefs(\stdClass $statement, StoreOptions $opts) {
    return $this->where($opts)
      ->where('statement.object.id', $statement->id)
      ->where('statement.object.objectType', 'StatementRef')
      ->get();
  }

  /**
   * Goes down the reference chain setting references (refs).
   * @param Model $model
   * @param [String] $visited IDs of statements visisted in the current chain (avoids infinite loop).
   * @param StoreOptions $opts
   * @return [Model]
   */
  private function downLink(Model $model, array $visited, StoreOptions $opts) {
    $statement = $this->formatModel($model);
    if (in_array($model, $visited)) {
      return array_slice($visited, array_search($model, $visited));
    }
    $visited[] = $model;
    $down_ref = $this->downRef($statement, $opts);
    if ($down_ref !== null) {
      $refs = $this->downLink($down_ref, $visited, $opts);
      $this->setRefs($statement, $refs, $opts);
      $this->unQueue($model);
      return array_merge([$model], $refs);
    } else {
      $this->unQueue($model);
      return [$model];
    }
  }

  /**
   * Gets the statement referred to by the given statement.
   * @param \stdClass $statement
   * @param StoreOptions $opts
   * @return Model
   */
  private function downRef(\stdClass $statement, StoreOptions $opts) {
    if (!$this->isReferencing($statement)) return null;
    return $this->getModel($statement->object->id, $opts);
  }

  /**
   * Updates the refs for the given statement.
   * @param \stdClass $statement
   * @param [\stdClass] $refs Statements that are referenced by the given statement.
   * @param StoreOptions $opts
   */
  private function setRefs(\stdClass $statement, array $refs, StoreOptions $opts) {
    $this->where($opts)
      ->where('statement.id', $statement->id)
      ->update([
        'refs' => array_map(function ($ref) {
          $statement = Helpers::replaceFullStop(json_decode(json_encode($ref->statement), true));
          $stored = new Carbon($statement['stored']);
          $timestamp = new Carbon($statement['timestamp']);
          $statement['stored'] = new MongoDate($stored->timestamp, $stored->micro);
          $statement['timestamp'] = new MongoDate($timestamp->timestamp, $timestamp->micro);
          return $statement;
        }, $refs)
      ]);
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
