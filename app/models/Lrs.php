<?php

use Jenssegers\Mongodb\Model as Eloquent;

class Lrs extends Eloquent {

  /**
   * Our MongoDB collection used by the model.
   *
   * @var string
   */
  protected $collection = 'lrs';
  protected $fillable = ['title', 'description', 'owner', 'users'];

  /**
   * Validation rules for statement input
   **/
  protected $rules = array('title' => 'required');

  public function validate( $data ) {
    return Validator::make($data, $this->rules);
  }

}