<?php namespace Locker\Repository\Client;

use \Illuminate\Database\Eloquent\Model as Model;
use \Locker\Repository\Base\EloquentRepository as BaseRepository;
use \Locker\XApi\Authority as XApiAuthority;
use \Locker\Helpers\Helpers as Helpers;

class EloquentRepository extends BaseRepository implements Repository {

  protected $model = '\Client';
  protected $defaults = [
    'authority' => [
      'name' => 'New Client',
      'mbox' => 'mailto:hello@learninglocker.net'
    ]
  ];

  /**
   * Constructs a query restricted by the given options.
   * @param [String => Mixed] $opts
   * @return \Jenssegers\Mongodb\Eloquent\Builder
   */
  protected function where(array $opts) {
    return (new $this->model)->where('lrs_id', $opts['lrs_id']);
  }

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
   * Generates a random value.
   * Used for generating usernames and passwords.
   * @return String Randomly generated value.
   */
  private function getRandomValue(){
    return sha1(uniqid(mt_rand(), true));
  }

  /**
   * Constructs a store.
   * @param Model $model Model to be stored.
   * @param [String => Mixed] $data Properties to be used on the model.
   * @param [String => Mixed] $opts
   * @return Model
   */
  protected function constructStore(Model $model, array $data, array $opts) {
    $data = array_merge($this->defaults, $data);
    $this->validateData($data);

    // Sets properties on model.
    $model->api = [
      'basic_key' => $this->getRandomValue(),
      'basic_secret' => $this->getRandomValue()
    ];
    $model->lrs_id = $opts['lrs_id'];
    $model->authority = $data['authority'];
    $model->scopes = ['all'];

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
    //dd($data);
    $this->validateData($data);

    // Sets properties on model.
    if (isset($data['authority'])) $model->authority = $data['authority'];
    if (isset($data['scopes'])) $model->scopes = $data['scopes'];

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
      'client_id' => $client->api['basic_key']
    ]);
    if ($this->where($opts)->count() < 2) {
      $this->store(['authority' => [
        'name' => 'Must have client',
        'mbox' => 'mailto:hello@learninglocker.net'
      ]], $opts);
    }
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
      ->where('api.basic_key', $username)
      ->where('api.basic_secret', $password)
      ->first();

    if ($model === null) throw new Exceptions\NotFound($id, $this->model);

    return $this->format($model);
  }
}