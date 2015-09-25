<?php

use Jenssegers\Mongodb\Model as Eloquent;

class Client extends Eloquent {

  /**
   * Our MongoDB collection used by the model.
   *
   * @var string
   */
  protected $collection = 'client';
  protected $fillable = ['authority', 'description', 'api', 'lrs_id', 'scopes'];
  
  /**
   * Delete the model from the database.
   *
   * @return bool|null
   * @throws \Exception
   */
  public function delete() {
    \DB::getMongoDB()->oauth_clients->remove([
      'client_id' => $this->api['basic_key']
    ]);
    
    parent::delete();
  }
  
  /**
   * All clients belong to an LRS
   *
   **/
  public function lrs() {
    return $this->belongsTo('Lrs');
  }

  public function setLrsIdAttribute($value) {
    $this->attributes['lrs_id'] = new \MongoId($value);
  }
  
  /**
   * Add a basic where clause to the client query.
   * Normally, Illuminate\Database\Eloquent\Model handles this method (through __call()).
   * This implementation converts foreign ids from strings to MongoIds.
   *
   * @param  string  $column
   * @param  string  $operator
   * @param  mixed   $value
   * @param  string  $boolean
   * @return Jenssegers\Mongodb\Eloquent\Builder
   */
  public static function where($column, $operator = null, $value = null, $boolean = 'and') {
    if (func_num_args() == 2) {
      list($value, $operator) = array($operator, '=');
    }
    if ($column == 'lrs_id') {
        $value = new \MongoId($value);
    }
    $instance = new static;
    $query = $instance->newQuery();
    return $query->where($column, $operator, $value, $boolean);
  }

}