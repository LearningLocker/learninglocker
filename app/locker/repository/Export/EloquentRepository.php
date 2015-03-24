<?php namespace Locker\Repository\Export;

use \Illuminate\Database\Eloquent\Model as Model;
use \Locker\Repository\Base\EloquentRepository as BaseRepository;
use \Locker\XApi\Helpers as XAPIHelpers;
use \Locker\Repository\Report\EloquentRepository as ReportRepository;

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

  /**
   * Chunks statements via an export.
   * @param Model $model Export to be used.
   * @param [String => Mixed] $opts
   */
  public function export(Model $model, array $opts) {
    $statements = (new ReportRepository)->statements($model->report, $opts);

    $this->first = true;
    $statements->chunk(1000, function ($statements) use ($model, $opts) {
      foreach ($statements as $statement) {
        if ($this->first) {
          $this->first = false;
        } else {
          $opts['next']();
        }

        $opts['stream']($this->mapFields($statement, $model->fields));
      }
    });
  }

  /**
   * Gets the value of a path from a nested array.
   * @param [String => Mixed] $arr
   * @param String $path Path of keys to the value.
   * @return Mixed Value of the path.
   */
  private function getField(array $arr, $path) {
    $keys = explode('.', $path);
    $len = count($keys);
    $i = 0;

    while ($i < $len && isset($arr[$keys[$i]])) {
      $arr = $arr[$keys[$i]];
      $i += 1;
    }

    return $i == $len ? $arr : null;
  }

  /**
   * Maps fields from statement keys (paths) to export keys.
   * @param \Statement $statement
   * @param [String => String] $fields
   * @return [String => Mixed]
   */
  private function mapFields(\Statement $statement, array $fields) {
    $mapped_statement = [];
    $assoc_statement = $statement->toArray();
    foreach ($fields as $field) {
      if (!is_null($field['to']) && !is_null($field['from'])) {
        $mapped_statement[$field['to']] =  $this->getField($assoc_statement, $field['from']);
      }
    }
    return $mapped_statement;
  }
}