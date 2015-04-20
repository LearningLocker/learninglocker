<?php namespace Locker\Repository\Statement;

use \Illuminate\Database\Eloquent\Model as Model;

abstract class EloquentReader {
  protected $model = '\Statement';

  /**
   * Constructs a query restricted by the given options.
   * @param [String => Mixed] $opts
   * @return \Jenssegers\Mongodb\Eloquent\Builder
   */
  protected function where(Options $opts) {
    return (new $this->model)->where('lrs._id', $opts->getOpt('lrs_id'));
  }

  /**
   * Gets the statement from the model as an Object.
   * @param Model $model
   * @return \stdClass
   */
  protected function formatModel(Model $model) {
    return json_decode(json_encode($model->statement));
  }
}
