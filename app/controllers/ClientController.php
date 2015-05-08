<?php

use Locker\Repository\User\UserRepository as UserRepo;
use Locker\Repository\Lrs\Repository as LrsRepo;
use Locker\Repository\Client\ClientRepository as ClientRepo; 

class ClientController extends BaseController {

  protected $user, $lrs, $client;
  
  /**
   * Constructs a new ClientController.
   * @param UserRepo $user
   * @param LrsRepo $lrs
   * @param ClientRepo $client
   */
  public function __construct(UserRepo $user, LrsRepo $lrs, ClientRepo $client) {
    $this->user = $user;
    $this->lrs = $lrs;
	  $this->client = $client;
  }
  
  /**
   * Load the manage clients page.
   * @param String $lrs_id
   * @return View
   */
  public function manage($lrs_id) {
    $opts = ['user' => \Auth::user()];
    $lrs = $this->lrs->show($lrs_id, $opts);
    $lrs_list = $this->lrs->index($opts); 
	  $clients = \Client::where('lrs_id', $lrs->id)->get();
    return View::make('partials.client.manage', [
      'clients' => $clients,
      'lrs' => $lrs,
      'list' => $lrs_list
		]);
  }
  
   /**
   * Load the manage clients page.
   * @param String $lrs_id
   * @param String $id
   * @return View
   */
  public function edit($lrs_id, $id) {
    $opts = ['user' => \Auth::user()];
    $lrs = $this->lrs->show($lrs_id, $opts);
    $lrs_list = $this->lrs->index($opts); 
	  $client = $this->client->find($id);
    $scopes = \App::make('db')->getMongoDb()->oauth_scopes->find()->getNext()['supported_scopes'];
	 	return View::make('partials.client.edit', [
      'client' => $client,
      'lrs' => $lrs,
      'list' => $lrs_list,
      'scopes' => $scopes
		]);
  }
  
  /**
   * Create a new client.
   * @param String $lrs_id
   * @return View
   */
  public function create($lrs_id) {
    $opts = ['user' => \Auth::user()];
    $lrs = $this->lrs->show($lrs_id, $opts);
	  $data = ['lrs_id' => $lrs->id];
	
    if ($this->client->create($data)) {
      $message_type = 'success';
      $message = trans('lrs.client.created_sucecss');
    } else {
      $message_type = 'error';
      $message = trans('lrs.client.created_fail');
    }
    
    return Redirect::back()->with($message_type, $message);
  }

  /**
   * Update the specified resource in storage.
   * @param String $lrs_id Id of the LRS.
   * @param String $id Id of the client.
   * @return View
   */
  public function update($lrs_id, $id){
    $input = Input::all();
    $input['scopes'] = array_values(isset($input['scopes']) ? $input['scopes'] : []);
    if ($this->client->update($id, $input)) {
      $redirect_url = '/lrs/'.$lrs_id.'/client/manage#'.$id;
      return Redirect::to($redirect_url)->with('success', trans('lrs.client.updated'));
    }

    return Redirect::back()
      ->withInput()
      ->withErrors($this->client->errors());
  }

  /**
   * Remove the specified resource from storage.
   * @param String $lrs_id
   * @param String $id
   * @return View
   */
  public function destroy($lrs_id, $id){
	  if ($this->client->delete($id)) {
      $message_type = 'success';
      $message = trans('lrs.client.delete_client_success');
    } else {
      $message_type = 'error';
      $message = trans('lrs.client.delete_client_error');
    }
	
    return Redirect::back()->with($message_type, $message);
  }
}
