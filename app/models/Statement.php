<?php

use Jenssegers\Mongodb\Model as Eloquent;

class Statement extends Eloquent {

  protected $collection = 'statements';
  protected $hidden = ['_id', 'created_at', 'updated_at'];
  protected $fillable = ['statement', 'active', 'voided', 'refs', 'lrs', 'timestamp'];

  public function lrs(){
    return $this->belongsTo('Lrs');
  }

}
