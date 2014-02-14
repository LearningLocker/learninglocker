<?php

use Jenssegers\Mongodb\Model as Eloquent;

class Site extends Eloquent {

  /**
   * Our MongoDB collection used by the model.
   *
   * @var string
   */
  protected $collection = 'site';

  /**
   * The attributes excluded from the model's JSON form.
   *
   * @var array
   */
  protected $hidden = array('created_at','updated_at');

  /**
   * Validation rules for statement input
   **/
  protected $rules = array('name'  => 'required',
               'email' => 'required|unique');

  public function validate( $data ) {
    return Validator::make($data, $this->rules);
  }


}