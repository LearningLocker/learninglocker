<?php

use Locker\Repository\User\UserRepository as UserRepo;
use Locker\Repository\Lrs\Repository as LrsRepo;
use Locker\Repository\Client\Repository as ClientRepo; 

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
	  $client = $this->client->show($id, ['lrs_id' => $lrs_id]);
	 	return View::make('partials.client.edit', [
      'client' => $client,
      'lrs' => $lrs,
      'list' => $lrs_list,
      'scopes' => [
        'all',
        'all/read',
        'statements/write',
        'statements/read',
        'statements/read/mine',
        'state',
        'profile',
      ],
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
	
    if ($this->client->store([], ['lrs_id' => $lrs_id])) {
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
    $data = Input::all();
    $data['scopes'] = array_values(isset($data['scopes']) ? $data['scopes'] : []);
    $authority = [
      'name' => $data['name'],
    ];

    switch ($data['ifi']) {
      case 'mbox': $authority['mbox'] = 'mailto:'.$data['mbox']; break;
      case 'mbox_sha1sum': $authority['mbox_sha1sum'] = $data['mbox_sha1sum']; break;
      case 'openid': $authority['openid'] = $data['openid']; break;
      case 'account': $authority['account'] = [
          'homePage' => $data['account_homePage'],
          'name' => $data['account_name']
        ]; break;
    }

    $data['authority'] = $authority;
    
    if ($this->client->update($id, $data, ['lrs_id' => $lrs_id])) {
      $redirect_url = '/lrs/'.$lrs_id.'/client/manage#'.$id;
      return Redirect::to($redirect_url)->with('success', trans('lrs.client.updated'));
    }

    return Redirect::back()
      ->withInput()
      ->withErrors(['Error']);
  }

  /**
   * Remove the specified resource from storage.
   * @param String $lrs_id
   * @param String $id
   * @return View
   */
  public function destroy($lrs_id, $id){
	  if ($this->client->destroy($id, ['lrs_id' => $lrs_id])) {
      $message_type = 'success';
      $message = trans('lrs.client.delete_client_success');
    } else {
      $message_type = 'error';
      $message = trans('lrs.client.delete_client_error');
    }
	
    return Redirect::back()->with($message_type, $message);
  }
}
