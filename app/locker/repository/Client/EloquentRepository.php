<?php namespace Locker\Repository\Client;

use \Illuminate\Database\Eloquent\Model as Model;
use \Locker\Repository\Base\EloquentRepository as BaseRepository;
use \Locker\XApi\Authority as XApiAuthority;
use \Locker\Helpers\Helpers as Helpers;

class EloquentRepository extends BaseRepository implements Repository {

  protected $model = '\Client';
  protected $defaults = [];

  /**
   * Validates data.
   * @param [String => Mixed] $data Properties to be changed on the model.
   * @throws \Exception
   */
  protected function validateData(array $data) {
    if (isset($data['authority'])) Helpers::validateAtom(
      XApiAuthority::createFromJson(json_encode($data['authority'])),
      'client.authority'
    );
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
    $data['authority'] = [
      'name' => 'New Client',
      'mbox' => 'mailto:hello@learninglocker.net'
    ];
    $this->validateData($data);

    // Sets properties on model.
    $model->username = \Locker\Helpers\Helpers::getRandomValue();
    $model->password = \Locker\Helpers\Helpers::getRandomValue();
    $model->lrs = $opts['lrs_id'];
    $model->authority = $data['authority'];

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
    if (isset($data['authority'])) $model->authority = $data['authority'];

    return $model;
  }

  /**
   * Creates a new model.
   * @param [String => Mixed] $data Properties of the new model.
   * @param [String => Mixed] $opts
   * @return Model
   */
  public function store(array $data, array $opts) {
    $client = parent::store($data, $opts);

    \DB::getMongoDB()->oauth_clients->insert([
      'client_id' => $client->api['basic_key'],
      'client_secret' => $client->api['basic_secret'],
      'redirect_uri' => 'http://www.example.com/'
    ]);

    return $client;
  }

  /**
   * Destroys the model with the given ID and options.
   * @param String $id ID to match.
   * @param [String => Mixed] $opts
   * @return Boolean
   */
  public function destroy($id, array $opts) {
    $client = $this->show($id, $opts);
    \DB::getMongoDB()->oauth_clients->remove([
      'client_id' => $client->username
    ]);
    return parent::destroy($id, $opts);
  }

  /**
   * Gets the model with the given username, password, and options.
   * @param String $username Username to match.
   * @param String $password Password to match.
   * @param [String => Mixed] $opts
   * @return Model
   */
  public function showFromUserPass($username, $password, array $opts) {
    $model = (new $this->model)
      ->where('username', $username)
      ->where('password', $password)
      ->first();

    if ($model === null) throw new Exceptions\NotFound($id, $this->model);

    return $this->format($model);
  }
}