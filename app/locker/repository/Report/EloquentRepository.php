<?php namespace Locker\Repository\Report;

use \Illuminate\Database\Eloquent\Model as Model;
use \Locker\Repository\Base\EloquentRepository as BaseRepository;
use \Locker\Repository\Query\EloquentQueryRepository as QueryRepository;
use \Locker\XApi\Helpers as XAPIHelpers;
use \Locker\Helpers\Helpers as Helpers;

class EloquentRepository extends BaseRepository implements Repository {

  protected $model = '\Report';
  protected $defaults = [
    'name' => 'New report',
    'description' => '',
    'query' => [],
    'since' => null,
    'until' => null
  ];

  /**
   * Validates data.
   * @param [String => Mixed] $data Properties to be changed on the model.
   * @throws \Exception
   */
  protected function validateData(array $data) {
    if (isset($data['name'])) XAPIHelpers::checkType('name', 'string', $data['name']);
    if (isset($data['description'])) XAPIHelpers::checkType('description', 'string', $data['description']);
    if (isset($data['query'])) XAPIHelpers::checkType('query', 'array', $data['query']);
    if (isset($data['since'])) XAPIHelpers::checkType('since', 'string', $data['since']);
    if (isset($data['until'])) XAPIHelpers::checkType('until', 'string', $data['until']);
  }

  protected function format(Model $model) {
    $model->query = Helpers::replaceHtmlEntity($model->query);
    return $model;
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
    $model->query = Helpers::replaceFullStop($data['query']);
    $model->since = $data['since'];
    $model->until = $data['until'];

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
    if (isset($data['query'])) $model->query = Helpers::replaceFullStop($data['query']);
    if (isset($data['since'])) $model->since = $data['since'];
    if (isset($data['until'])) $model->until = $data['until'];

    return $model;
  }

  /**
   * Sets the query.
   * @param [type] $lrs    [description]
   * @param [type] $query  [description]
   * @param [type] $field  [description]
   * @param [type] $wheres [description]
   */
  public function setQuery($lrs, $query, $field, $wheres) {
    return \Statement::select($field)
      ->where('lrs._id', $lrs)
      ->where($wheres, 'like', '%'.$query.'%')
      ->distinct()
      ->get()
      ->take(6);
  }

  /**
   * Gets the statements selected by the report with the given ID and options.
   * @param String $id ID to match.
   * @param [String => Mixed] $opts
   * @return [[String => Mixed]] Statements selected by the report.
   */
  public function statements($id, array $opts) {
    $report = $this->show($id, $opts);
    return (new QueryRepository)->where(
      $report->lrs,
      Helpers::replaceHtmlEntity($report->where)
    )->orderBy('statement.stored', 'DESC');
  }
}