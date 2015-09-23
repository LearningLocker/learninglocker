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
}