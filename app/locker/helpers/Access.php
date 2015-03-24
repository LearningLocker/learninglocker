<?php namespace Locker\Helpers;

class Access {

  /**
   * Check user is a certain role.
   *
   * @param $role  String  The role to match logged in user against
   *
   **/
  public static function isRole( $role ){

    if( \Auth::user()->role == $role ){
      return true;
    }

    return false;

  }

}