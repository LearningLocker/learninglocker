<?php

use Jenssegers\Mongodb\Model as Eloquent;

class Client extends Eloquent {

  /**
   * Our MongoDB collection used by the model.
   *
   * @var string
   */
  protected $collection = 'client';
  
   /**
   * All clients belong to an LRS
   *
   **/
  public function lrs(){
    return $this->belongsTo('Lrs');
  }

}