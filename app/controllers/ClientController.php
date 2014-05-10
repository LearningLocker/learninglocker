<?php

use Locker\Repository\User\UserRepository as User;
use Locker\Repository\Lrs\LrsRepository as Lrs;
use Locker\Repository\Client\ClientRepository as Client; //this is currently generating an error - 
//Illuminate \ Container \ BindingResolutionException
//Target [Locker\Repository\Client\ClientRepository] is not instantiable.

class ClientController extends BaseController {

  /**
  * User
  */
  protected $user;

  /**
   * Lrs
   **/
  protected $lrs;
  
  /**
   * Client
   **/
  protected $client;
  

  /**
   * Construct
   *
   * @param User $user
   * @param Lrs $lrs
   * @param Client $client
   */
  public function __construct(User $user, Lrs $lrs, Client $client){

    $this->user = $user;
    $this->lrs  = $lrs;
	$this->client  = $client;
    $this->logged_in_user = Auth::user();
    
  }
  
  /**
   * Load the manage clients page
   *
   * @param  int  $id
   * @return View
   */
  public function manage($id){
  	
     $lrs    = $this->lrs->find( $id );
     $lrs_list = $this->lrs->all(); 
	
	 $clients = \Client::where('lrs_id', $lrs->id)->get();
	 	  
	 
     return View::make('partials.client.manage', array('clients'    => $clients,
						                        'lrs'           => $lrs,
						                        'list'          => $lrs_list
												));
  }
  
   /**
   * Load the manage clients page
   *
   * @param  int  $lrs_id
   * @param  int  $id
   * @return View
   */
  public function edit($lrs_id, $id){
  	
     $lrs    = $this->lrs->find( $lrs_id );
     $lrs_list = $this->lrs->all(); 
	
	 $client = $this->client->find( $id );
	 	  
	 
     return View::make('partials.client.edit', array('client'    => $client,
						                        'lrs'           => $lrs,
						                        'list'          => $lrs_list
												));
  }
  
    /**
   * Create a new client
   *
   * @param  int  $id
   * @return View
   **/

  public function create($id){

	$lrs = $this->lrs->find( $id );
	
	$data = array('lrs_id' => $lrs->id);
	
    if( $this->client->create( $data ) ){
      $message_type = 'success';
      $message      = Lang::get('update_key');
    }else{
      $message_type = 'error';
      $message      = Lang::get('update_key_error');
    }
    
    return Redirect::back()->with($message_type, $message);
  }

  /**
   * Update the specified resource in storage.
   *
   * @param  int  $id
   * @return View
   */
  public function update($lrs_id, $id){

    /*$data = Input::all();

    //TODO :client input validation This may be able to re-use some of the statement validator
    $rules['title']        = 'required|alpha_spaces';
    $rules['description']  = 'alpha_spaces';       
    $validator = Validator::make($data, $rules);
    if ($validator->fails()) return Redirect::back()->withErrors($validator);
	 */

	 
	//{{ URL() }}/lrs/{{ $lrs->_id }}/client/manage#{{ $client->_id }} 
	
    if($this->client->update( $id, Input::all() )){
      return Redirect::to('/lrs/'.$lrs_id.'/client/manage#'.$id)->with('success', Lang::get('lrs.client.updated'));
    }

    return Redirect::back()
          ->withInput()
          ->withErrors($this->client->errors());

  }


  /**
   * Remove the specified resource from storage.
   *
   * @param  int  $lrs_id
   * @param  int  $id
   * @return View
   */
  public function destroy($lrs_id, $id){

	if( $this->client->delete($id) ){
      $message_type = 'success';
      $message      = Lang::get('delete_client_success');
    }else{
      $message_type = 'error';
      $message      = Lang::get('delete_client_error');
    }
	
   return Redirect::back()->with($message_type, $message);

  }

}