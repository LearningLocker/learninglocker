<?php namespace Locker\Repository\Export;

use \Illuminate\Database\Eloquent\Model as Model;
use \Locker\Repository\Base\EloquentRepository as BaseRepository;
use \Locker\Repository\Report\EloquentRepository as ReportRepository;
use \Locker\XApi\Helpers as XAPIHelpers;

class EloquentRepository extends BaseRepository implements Repository {

  protected $model = '\Export';
  protected $defaults = [
    'name' => 'New export',
    'description' => '',
    'fields' => [],
    'report' => '' // @todo Deprecate this property so that exports can be used without a report.
  ];
  protected $first = true; // Used by export method.

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

  private function getField($object, $field) {
    $keys = explode('.', $field);
    $len = count($keys);
    $i = 0;

    while ($i < $len && isset($object[$keys[$i]])) {
      $object = $object[$keys[$i]];
      $i += 1;
    }

    if ($i == $len) {
      return $object;
    } else {
      return null
    }
  }

  private function mapFields($statement, array $fields) {
    $mappedStatement = [];

    foreach ($fields as $field) {
      if (!is_null($field['to'])) {
        $mappedStatement[$field['to']] = 
          !is_null($field['from']) ?
          $this->getField($statement, $field['from']) :
          null;
      }
    }

    return $mappedStatement;
  }

  protected function export(Model $model, array $opts) {
    $statements = (new ReportRepository)->statements($model->report, $opts);

    $this->first = true;
    $statements->chunk(1000, function (array $statements) use ($model, $opts) {
      array_map(function ($statement) use ($model, $opts) {
        $this->first ? $this->first = false : $next();
        $stream($this->mapFields($statement, $model->fields));
      }, $statements);
    });
  }
}