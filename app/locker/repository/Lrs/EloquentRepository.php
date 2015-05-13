<?php namespace Locker\Repository\Lrs;

use \Illuminate\Database\Eloquent\Model as Model;
use \Locker\Repository\Base\EloquentRepository as BaseRepository;
use \Locker\XApi\Helpers as XAPIHelpers;
use \Locker\Helpers\Helpers as Helpers;
use \Event as Event;
use \Statement as StatementModel;

class EloquentRepository extends BaseRepository implements Repository {
  protected $model = '\Lrs';
  protected $defaults = [
    'title' => 'New LRS',
    'description' => ''
  ];

  /**
   * Constructs a query restricted by the given options.
   * @param [String => Mixed] $opts
   * @return \Jenssegers\Mongodb\Eloquent\Builder
   */
  protected function where(array $opts) {
    return (new $this->model);
  }

  /**
   * Validates data.
   * @param [String => Mixed] $data Properties to be changed on the model.
   * @throws \Exception
   */
  protected function validateData(array $data) {
    if (isset($data['title'])) XAPIHelpers::checkType('title', 'string', $data['title']);
    if (isset($data['description'])) XAPIHelpers::checkType('description', 'string', $data['description']);
    if (isset($data['owner'])) XAPIHelpers::checkType('owner', 'array', $data['owner']);
    if (isset($data['owner']['_id'])) XAPIHelpers::checkType('owner._id', 'string', $data['owner']['_id']);

    // Validate users.
    if (isset($data['users'])) {
      XAPIHelpers::checkType('users', 'array', $data['users']);
      foreach ($data['users'] as $key => $field) {
        XAPIHelpers::checkType("fields.$key", 'array', $field);
        if (isset($field['_id'])) XAPIHelpers::checkType("fields.$key._id", 'string', $field['_id']);
        if (isset($field['email'])) XAPIHelpers::checkType("fields.$key.email", 'string', $field['email']);
        if (isset($field['name'])) XAPIHelpers::checkType("fields.$key.name", 'string', $field['name']);
        if (isset($field['role'])) XAPIHelpers::checkType("fields.$key.role", 'string', $field['role']);
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
    $data = array_merge($this->defaults, $data, [
      'owner' => ['_id' => $opts['user']->_id],
      'users' => [[
        '_id'   => $opts['user']->_id,
        'email' => $opts['user']->email,
        'name'  => $opts['user']->name,
        'role'  => 'admin'
      ]]
    ]);
    $this->validateData($data);

    // Sets properties on model.
    $model->title = $data['title'];
    $model->description = $data['description'];
    $model->owner = $data['owner'];
    $model->users = $data['users'];

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
    if (isset($data['title'])) $model->title = $data['title'];
    if (isset($data['description'])) $model->description = $data['description'];

    return $model;
  }

  /**
   * Gets all of the available models with the options.
   * @param [String => Mixed] $opts
   * @return [Model]
   */
  public function index(array $opts) {
    if ($opts['user']->role === 'super') {
      $query = $this->where($opts);
    } else {
      $query = $this->where([])->where('users._id', $opts['user']->_id)->remember(10);
    }

    $obj_result = $query->get()->sortBy(function (Model $model) {
      return strtolower($model->title);
    })->each(function (Model $model) {
      return $this->format($model);
    });

    // Annoying hack to convert stupid Laravel collection object to an array
    // WITHOUT converting the models to associative arrays!!!
    $result = [];
    foreach ($obj_result->getIterator() as $model) {
      $result[] = $model;
    }

    return $result;
  }

  /**
   * Destroys the model with the given ID and options.
   * @param String $id ID to match.
   * @param [String => Mixed] $opts
   * @return Boolean
   */
  public function destroy($id, array $opts) {
    StatementModel::where('lrs._id', $id)->delete();
    return parent::destroy($id, $opts);
  }

  public function removeUser($id, $user_id) {
    return $this->where([])->where('_id', $id)->pull('users', ['_id' => $user_id]);
  }

  public function getLrsOwned($user_id) {
    return $this->where([])->where('owner._id', $user_id)->select('title')->get()->toArray();
  }

  public function getLrsMember($user_id) {
    return $this->where([])->where('users._id', $user_id)->select('title')->get()->toArray();
  }

  public function changeRole($id, $user_id, $role) {
    $lrs = $this->show($id, []);
    $lrs->users = array_map(function ($user) use ($user_id, $role) {
      $user['role'] = $user['_id'] === $user_id ? $role : $user['role'];
      return $user;
    }, $lrs->users);
    return $lrs->save();
  }
}
