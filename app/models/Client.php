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
   * All clients belong to an LRS
   *
   **/
  public function lrs(){
    return $this->belongsTo('Lrs');
  }

}