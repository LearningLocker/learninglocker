<?php namespace Locker\Repository\Statement;

abstract class EloquentReader {
  protected $model = '\Statement';

  /**
   * Constructs a query restricted by the given options.
   * @param [String => Mixed] $opts
   * @return \Jenssegers\Mongodb\Eloquent\Builder
   */
  protected function where(array $opts) {
    return (new $this->model)->where('lrs._id', $opts['lrs_id']);
  }
}
