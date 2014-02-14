<?php

use Jenssegers\Mongodb\Model as Eloquent;

class Statement extends Eloquent {

  /**
   * Our MongoDB collection used by the model.
   *
   * @var string
   */
  protected $collection = 'statements';

  /**
   * The attributes excluded from the model's JSON form.
   *
   * @var array
   */
  protected $hidden = array('created_at','updated_at','_id');

  /**
   * For mass assigning which we use for TC statements,
   * set the fillable fields.
   **/
  protected $fillable = array('actor', 'verb', 'result', 'object', 'context','learninglocker', 
    'authority', 'stored', 'timestamp', 'id', 'attachments', 'version');

  /**
   * All statements belong to an LRS
   *
   **/
  public function lrs(){
    return $this->belongsTo('Lrs');
  }

}