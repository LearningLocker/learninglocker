<?php namespace Locker\Repository\Export;

use \Illuminate\Database\Eloquent\Model as Model;
use \Locker\Repository\Base\EloquentRepository as BaseRepository;
use \Locker\XApi\Helpers as XAPIHelpers;

class EloquentRepository extends BaseRepository implements Repository {

  protected $model = '\Export';
  protected $defaults = [
    'name' => 'New export',
    'description' => '',
    'fields' => [],
    'report' => '' // @todo Deprecate this property so that exports can be used without a report.
  ];

  /**
   * Validates data.
   * @param [String => Mixed] $data Properties to be changed on the model.
   * @throws \Exception
   */
  protected function validateData(array $data) {
    if (isset($data['name'])) XAPIHelpers::checkType('name', 'string', $data['name']);
    if (isset($data['description'])) XAPIHelpers::checkType('description', 'string', $data['description']);
    if (isset($data['report'])) XAPIHelpers::checkType('report', 'string', $data['report']);

    // Validates fields.
    if (isset($data['fields'])) {
      XAPIHelpers::checkType('fields', 'array', $data['fields']);
      foreach ($data['fields'] as $key => $field) {
        XAPIHelpers::checkType("fields.$key", 'array', $field);
      }
    }
  }

  /**
   * Constructs a store.
   * @param Model $model Model to be stored.
   * @param [String => Mixed] $data Properties to be used on the model.
   * @param [String => Mixed] $opts
   * @return Model
   */
  protected function constructStore(Model $model, array $data, array $opts) {
    // Merges and validates data with defaults.
    $data = array_merge($this->defaults, $data);
    $this->validateData($data);

    // Sets properties on model.
    $model->name = $data['name'];
    $model->description = $data['description'];
    $model->lrs = $opts['lrs_id'];
    $model->fields = $data['fields'];
    $model->report = $data['report'];

    return $model;
  }

  /**
   * Constructs a update.
   * @param Model $model Model to be updated.
   * @param [String => Mixed] $data Properties to be changed on the model.
   * @param [String => Mixed] $opts
   * @return Model
   */
  protected function constructUpdate(Model $model, array $data, array $opts) {
    $this->validateData($data);

    // Sets properties on model.
    if (isset($data['name'])) $model->name = $data['name'];
    if (isset($data['description'])) $model->description = $data['description'];
    if (isset($data['fields'])) $model->fields = $data['fields'];
    if (isset($data['report'])) $model->report = $data['report'];

    return $model;
  }
}