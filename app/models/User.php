<?php

use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;
use Jenssegers\Mongodb\Model as Eloquent;

class User extends Eloquent implements UserInterface, RemindableInterface {

  protected $guarded = array('_id');

  /**
   * Our MongoDB collection used by the model.
   *
   * @var string
   */
  protected $collection = 'users';

  /**
   * The attributes excluded from the model's JSON form.
   *
   * @var array
   */
  protected $hidden = array('password');

  protected $rules = array(
      'email'    => 'required|email|unique:users',
      'name'     => 'required',
      'password' => 'required|confirmed'
    );

  public function validate( $data ) {
    return Validator::make($data, $this->rules);
  }

  /**
   * Get the unique identifier for the user.
   *
   * @return mixed
   */
  public function getAuthIdentifier()
  {
    return $this->getKey();
  }

  /**
   * Get the password for the user.
   *
   * @return string
   */
  public function getAuthPassword()
  {
    return $this->password;
  }

  /**
   * Get the e-mail address where password reminders are sent.
   *
   * @return string
   */
  public function getReminderEmail()
  {
    return $this->email;
  }

}