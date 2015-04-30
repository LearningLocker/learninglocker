<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Exceptions as Exceptions;
use \Locker\XApi\Statement as XApiStatement;
use \Illuminate\Database\Eloquent\Model as Model;

interface ShowerInterface {
  public function show($id, ShowOptions $opts);
}

class EloquentShower extends EloquentReader implements ShowerInterface {

  /**
   * Gets the model with the given ID and options.
   * @param String $id ID to match.
   * @param ShowOptions $opts
   * @return Model
   */
  public function show($id, ShowOptions $opts) {
    $model = $this->where($opts)
      ->where('statement.id', $id)
      ->where('voided', $opts->getOpt('voided'))
      ->where('active', $opts->getOpt('active'))
      ->first();

    if ($model === null) throw new Exceptions\NotFound($id, $this->model);

    return $this->formatModel($model);
  }
}
