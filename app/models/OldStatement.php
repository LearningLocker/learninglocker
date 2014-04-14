<?php

use Jenssegers\Mongodb\Model as Eloquent;

class OldStatement extends Eloquent {

  /**
   * Our MongoDB collection used by the model.
   *
   * @var string
   */
  protected $collection = 'old_statements';

  /**
   * We don't need default Laravel created_at
   **/
  public $timestamps = false;

  /**
   * The attributes excluded from the model's JSON form.
   *
   * @var array
   */
  protected $hidden = array('_id');

  /**
   * For mass assigning which we use for TC statements,
   * set the fillable fields.
   **/
  // protected $fillable = array('actor', 'verb', 'result', 'object', 'context', 
  //   'authority', 'stored', 'timestamp', 'id', 'attachments', 'version');

  protected $fillable = array('lrs', 'statement');

  /**
   * All statements belong to an LRS
   *
   **/
  public function lrs(){
    return $this->belongsTo('Lrs');
  }

}