<?php

use Jenssegers\Mongodb\Model as Eloquent;

class Lrs extends Eloquent {

	/**
	 * Our MongoDB collection used by the model.
	 *
	 * @var string
	 */
	protected $collection = 'lrs';

	/**
	 * The attributes excluded from the model's JSON form.
	 *
	 * @var array
	 */
	protected $hidden = array('created_at','updated_at');
	/**
	 * Validation rules for statement input
	 **/
	protected $rules = array('title' => 'required');

	public function validate( $data ) {
		return Validator::make($data, $this->rules);
	}

}