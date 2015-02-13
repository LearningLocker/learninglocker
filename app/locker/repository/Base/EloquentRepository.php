<?php namespace Locker\Repository\Base;

use \Helpers\Exceptions\NotFound as NotFoundException;
use \Illuminate\Database\Eloquent\Model as Model;

abstract class EloquentRepository implements Repository {

  abstract protected function constructUpdate(Model $model, array $data, array $opts);
  abstract protected function constructStore(Model $model, array $data, array $opts);

  /**
   * Constructs a query restricted to the given authority.
   * @param [String => Mixed] $opts
   * @return \Jenssegers\Mongodb\Eloquent\Builder
   */
  protected function where(array $opts) {
    return (new $this->model)->where('lrs', $opts['lrs_id']);
  }

  /**
   * Gets all of the available models with the options.
   * @param [String => Mixed] $opts
   * @return [Model]
   */
  public function index(array $opts) {
    return $this->where($opts)->get();
  }

  /**
   * Gets the model with the given ID and options.
   * @param String $id ID to match.
   * @param [String => Mixed] $opts
   * @return Model
   */
  public function show($id, array $opts) {
    $model = $this
      ->where($opts)
      ->where('_id', $id)
      ->first();

    if ($model === null) throw new NotFoundException($id, $this->model);

    return $model;
  }

  /**
   * Destroys the model with the given ID and options.
   * @param String $id ID to match.
   * @param [String => Mixed] $opts
   * @return Boolean
   */
  public function destroy($id, array $opts) {
    return $this->show($id, $opts)->delete();
  }

  /**
   * Creates a new model.
   * @param [String => Mixed] $data Properties of the new model.
   * @param [String => Mixed] $opts
   * @return Model
   */
  public function store(array $data, array $opts) {
    $model = $this->constructStore((new $this->model), $data, $opts);
    $model->save();
    return $model;
  }

  /**
   * Updates an existing model.
   * @param String $id ID to match.
   * @param [String => Mixed] $data Properties to be changed on the existing model.
   * @param [String => Mixed] $opts
   * @return Model
   */
  public function update($id, array $data, array $opts) {
    $model = $this->constructUpdate($this->show($id, $opts), $data, $opts);
    $model->save();
    return $model;
  }
}