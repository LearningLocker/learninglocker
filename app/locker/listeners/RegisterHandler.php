<?php namespace app\locker\listeners;

class RegisterHandler {

  public function handle($user){
  
    //if first user, create site object
    if( \User::count() == 1){
      $site            = new \Site;
      $site->name        = '';
      $site->description = '';
      $site->email       = $user->email;
      $site->lang        = 'en-US';
      $site->create_lrs  = array('super');
      $site->registration = 'Closed';
      $site->restrict    = 'None'; //restrict registration to a specific email domain
      $site->domain      = '';
      $site->super       = array( array('user' => $user->_id ) );
      $site->save();
    }

    //now send an email asking to verify email
    $this->sendEmail( $user );

  }

  public function domain_check( $data ){

    $site = \Site::first();

    //has a domain been set?
    if( $site ){
      $domain = $site->domain;
      if( $site->domain != '' ){
        $allowed_domain = array($domain);
        // Make sure the address is valid
        if ( filter_var($data['email'], FILTER_VALIDATE_EMAIL) ){

          //get submitted email domain
          $email = explode('@', $data['email']);
          $email = array_pop( $email );

          if ( !in_array($email, $allowed_domain) ){
            return false;
          }

        }
      }
    }

    return true;

  }

  public function resentEmailVerification($user){
    $this->sendEmail( $user );
  }

  private function sendEmail( $user ){
    \Locker\Helpers\User::sendEmailValidation( $user );
  }

}