<?php

use Jenssegers\Mongodb\Model as Eloquent;

class OAuthApp extends Eloquent {

  /**
   * Our MongoDB collection used by the model.
   *
   * @var string
   */
  protected $collection = 'oauth_apps';

  //@todo put in validation. callback, website, name and description required.
  protected $rules = array('name'     => 'required',
                           'website'  => 'required',
                           'callback' => 'required',
                           'rules'    => 'required');

  public function validate( $data ) {
    return Validator::make($data, $this->rules);
  }


}