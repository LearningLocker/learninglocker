<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Exceptions as Exceptions;
use \Locker\Helpers\Helpers as Helpers;
use \Locker\XApi\Helpers as XApiHelpers;
use \Jenssegers\Mongodb\Eloquent\Builder as Builder;
use \Illuminate\Database\Eloquent\Model as Model;

interface ShowerInterface {
  public function show($id, array $opts);
  public function format(Model $model);
}

class EloquentShower extends EloquentReader implements ShowerInterface {

  /**
   * Gets the model with the given ID and options.
   * @param String $id ID to match.
   * @param [String => Mixed] $opts
   * @return Model
   */
  public function show($id, array $opts) {
    $opts = $this->mergeDefaultOptions($opts);
    $model = $this->query->where($opts)
      ->where('statement.id', $id)
      ->where('voided', $opts['voided'])
      ->where('active', $opts['active'])
      ->first();

    if ($model === null) throw new Exceptions\NotFound($id, $this->model);

    return $model;
  }

  /**
   * Formats the model before returning.
   * @param Model $model
   * @return Model
   */
  public function format(Model $model) {
    return $model->statement;
  }

  /**
   * Returns all of the index options set to their default or given value (using the given options).
   * @param [String => mixed] $opts
   * @return [String => mixed]
   */
  protected function mergeDefaultOptions(array $opts) {
    return array_merge([
      'voided' => false,
      'active' => true
    ], $opts);
  }
}
