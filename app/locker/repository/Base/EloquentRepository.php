<?php namespace Locker\Repository\Base;

use \Locker\Helpers\Exceptions as Exceptions;
use \Illuminate\Database\Eloquent\Model as Model;

abstract class EloquentRepository implements Repository {

  abstract protected function constructUpdate(Model $model, array $data, array $opts);
  abstract protected function constructStore(Model $model, array $data, array $opts);

  /**
   * Constructs a query restricted by the given options.
   * @param [String => Mixed] $opts
   * @return \Jenssegers\Mongodb\Eloquent\Builder
   */
  protected function where(array $opts) {
    return (new $this->model)->where('lrs', $opts['lrs_id']);
  }

  /**
   * Fires an event.
   * @param Boolean $allow Determines if the event is allowed to fire.
   * @param String $event Name of the event to fire.
   * @param [String => Mixed] $opts
   * @param [String => Mixed] $extra Additional options.
   */
  protected function fire($allow, $event, array $opts, array $extra) {
    if ($allow) {
      \Event::fire(ltrim($this->model, '\\').'.'.$event, [array_merge($opts, $extra)]);
    }
    return $allow;
  }

  /**
   * Gets all of the available models with the options.
   * @param [String => Mixed] $opts
   * @return [Model]
   */
  public function index(array $opts) {
    return $this->where($opts)->get()->each(function (Model $model) {
      return $this->format($model);
    });
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

    if ($model === null) throw new Exceptions\NotFound($id, $this->model);

    return $this->format($model);
  }

  /**
   * Destroys the model with the given ID and options.
   * @param String $id ID to match.
   * @param [String => Mixed] $opts
   * @return Boolean
   */
  public function destroy($id, array $opts) {
    $model = $this->show($id, $opts);
    return $this->fire($model->delete(), 'destroy', $opts, [
      'id' => $id
    ]);
  }

  /**
   * Creates a new model.
   * @param [String => Mixed] $data Properties of the new model.
   * @param [String => Mixed] $opts
   * @return Model
   */
  public function store(array $data, array $opts) {
    $model = $this->constructStore((new $this->model), $data, $opts);
    $this->fire($model->save(), 'store', $opts, [
      'data' => $data,
      'model' => $model
    ]);
    return $this->format($model);
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
    $this->fire($model->save(), 'store', $opts, [
      'id' => $id,
      'data' => $data,
      'model' => $model
    ]);
    return $this->format($model);
  }

  /**
   * Formats the model(s) before returning.
   * @param Model $model
   * @return Model
   */
  protected function format(Model $model) {
    return $model;
  }
}
