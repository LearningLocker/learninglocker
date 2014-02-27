<?php namespace Locker\Repository\Site;

use Site;

class EloquentSiteRepository implements SiteRepository {

  public function all(){
    return Site::get()->first();
  }

  public function find($id){
    return Site::find($id);
  }

  public function validate($data){
    $site = new Site;
    return $site->validate( $data );
  }

  public function create( $data ){

    //check site has not already been set

    $site            = new Site;
    $site->name        = $data['name'];
    $site->description = $data['description'];
    $site->email       = $data['email'];
    $site->lang        = $data['lang'];
    $site->create_lrs  = array('super');
    $site->api         = $data['api'];
    $site->registration = $data['registration'];
    $site->restrict    = $data['restrict']; //restrict registration to a specific email domain
    $site->super       = array( array('user' => \Auth::user()->_id ) );
    $site->save();

    return $site;
    //return User::create($input);
  }

  public function update($id, $data){

    $site = $this->find( $id );
    $site->name        = $data['name'];
    $site->description = $data['description'];
    $site->email       = $data['email'];
    $site->lang        = $data['lang'];
    $site->create_lrs  = $data['create_lrs'];
    $site->api         = $data['api'];
    $site->registration = $data['registration'];
    $site->domain      = $data['domain']; //restrict registration to a specific email domain
    return $site->save();

  }

  public function delete($id){
    
    $site = $this->find($id);
    return $site->delete();
  }

  public function verifyUser( $user_id ){
    //check user exists
    $user = \User::find( $user_id );
    if( $user ){
      $user->verified = 'yes';
      $user->save();
    }
    return $user;
  }

  public function inviteUsers( $data ){

    if( $data ){
      \app\locker\helpers\User::inviteUser( $data );
    }
  
  }

}