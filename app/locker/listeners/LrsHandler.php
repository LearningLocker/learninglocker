<?php namespace app\locker\listeners;

class LrsHandler {

  public function handle($user){
  
    /**
     * If the user has role observer, change to admin
     * now they have created an LRS.
     **/
    // if( $user->role == 'observer' ){
    //   $user->role = 'admin';
    //   $user->save();
    // }

  }

}