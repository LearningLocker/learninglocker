<?php namespace Locker\Helpers;

class User {

  /**
   * Set a token to be used with email validation
   *
   **/
  public static function setEmailToken( $user, $email ){

    $token = sha1(uniqid(mt_rand(), true)); //we can do something more robust later
    \DB::table('user_tokens')->insert(
      array('email' => $email, 'token' => $token)
    );
    return $token;

  }

  /**
   * This is used for the primary email when the user creates an account.
   **/
  public static function sendEmailValidation( $user ){

    $data = array('token' => User::setEmailToken( $user, $user->email ));

    \Mail::send('emails.verify', $data, function($message) use ($user){
      $message->to($user->email, $user->name)->subject('Welcome, please verify your email');
    });
    
  }

  /**
   * Invite in a user. 
   **/
  public static function inviteUser( $data ){

    //explode email addresses
    $emails = explode("\r\n", $data['emails']);

    foreach( $emails as $e ){

      $isMember = false;

      //make sure lower case
      $e = strtolower($e);

      //check it is a valid email address
      if ( filter_var($e, FILTER_VALIDATE_EMAIL) ){

        //does the user already exist? If so, skip next step
        $user = \User::where('email', $e)->first();
        $user_exists = false; //boolean used to determine if add to lrs email sent

        if( !$user ){

          //create a user account
          $user       = new \User;
          $user->name   = $e;
          $user->email  = $e;
          $user->verified = 'no';
          $user->role   = $data['role'] ? $data['role'] : 'observer';
          $user->password = \Hash::make(base_convert(uniqid('pass', true), 10, 36));
          $user->save(); 

        }else{
          $user_exists = true;
        }

        //was an LRS id passed? If so, add user to that LRS as an observer
        if( isset($data['lrs']) ){

          $lrs = \Lrs::find( $data['lrs'] );

          //is the user already a member of the LRS?
          $isMember = \Locker\Helpers\Lrs::isMember($lrs->_id, $user->_id);

          //if lrs exists and user is not a member, add them
          if( $lrs && !$isMember){
            $existing  = $lrs->users;
            array_push($existing, array('_id'   => $user->_id,
                          'email' => $user->email,
                          'role'  => 'observer' ));
            $lrs->users = $existing;
            $lrs->save();
          }

        }

        //if user is already a member, exit here
        if( $isMember ){
          continue;
        }

        //determine which message to send to the user
        if( $user_exists && isset($lrs) ){
          //set data to use in email
          $set_data = array('sender' => \Auth::user(), 'lrs' => $lrs);
          //send out message to user
          \Mail::send('emails.lrsInvite', $set_data, function($message) use ($user){
            $message->to($user->email, $user->name)->subject('You have been added to an LRS.');
          });
        }elseif( $user_exists){
          //do nothing as they are already in the system
        }else{
          //if adding to lrs, get lrs title, otherwise use the site name
          isset($lrs) ? $title = 'the ' . $lrs->title . ' LRS' : $title = \Site::first()->name . '\'s Learning Locker';
          //set data to use in email
          $set_data = array('token'          => User::setEmailToken( $user, $user->email ), 
                            'custom_message' => $data['message'],
                            'title'          => $title,
                            'sender'         => \Auth::user());

          //send out message to user
          \Mail::send('emails.invite', $set_data, function($message) use ($user){
            $message->to($user->email, $user->name)->subject('You have been invited to join our LRS.');
          });

        }

      }

    }
    
  }

}