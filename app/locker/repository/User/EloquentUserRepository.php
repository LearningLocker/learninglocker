<?php namespace Locker\Repository\User;

use User;

class EloquentUserRepository implements UserRepository {

	public function all(){
		return User::all();
	}

	public function find($id){
		return User::find($id);
	}

	public function validate($data){
		$user = new User;
		return $user->validate( $data );
	}

	public function create(){
		$get_users = $this->all();
		//if it is the first user, give all three roles, else, go with observer
		if( count($get_users) == 0 ){
			$role = 'super'; //\app\locker\helpers\Access::roles();
		}else{
			$role = 'observer';
		}
		$user 			= new User;
		$user->name 	= \Input::get('name');
		$user->email 	= \Input::get('email');
		$user->verified = 'no';
		$user->role 	= $role;
		$user->password = \Hash::make(\Input::get('password'));
	   
		$user->save();

		return $user;
		
	}

	public function update($id, $data){

		$user = $this->find($id);
		$user->name  = $data['name'];
		$user->email = $data['email'];
		return $user->save();

	}

	public function verifyEmail($token){

		//first see if a record exists for that email and token
		$email = \DB::table('user_tokens')
				 ->where('token', $token)
				 ->pluck('email');

		if( $email ){
			//verify email
			\User::where('email', $email)->update(array('verified' => 'yes'));
			$message_type = 'success';
			$message = \Lang::get('users.email_verified');
		}else{
			$message_type = 'error';
			$message = \Lang::get('users.email_verified_error');
		}

		return $message;

	}

	public function updateRole( $user, $role ){

		$user 		= $this->find( $user );
		$user->role	= $role;
		return $user->save();

	}

	public function updatePassword($id, $password){

		$user = $this->find($id);
		$user->password	= \Hash::make( $password );
		$user->save();
		return $user;

	}

	public function delete( $id ){
		
		$user = $this->find($id);

		//@todo transfer all LRSs they own to the system admin

		//remove users from any LRSs
		\DB::table('lrs')->pull('users', array('_id' => $user->_id));

		//delete user document
		return $user->delete();
		
	}

}