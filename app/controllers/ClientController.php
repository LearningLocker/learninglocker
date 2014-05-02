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
   */
  public function __construct(User $user, Lrs $lrs, Client $client){

    $this->user = $user;
    $this->lrs  = $lrs;
	$this->client  = $client;
    $this->logged_in_user = Auth::user();


    
  }
  
  /**
   * 
   *
   * @return View
   */
  public function manage($id){

     $lrs    = $this->lrs->find( $id );
     $lrs_list = $this->lrs->all();
     return View::make('partials.client.manage', array('lrs'          => $lrs, 
                                                     'endpoint_nav' => true,
                                                     'list'         => $lrs_list));
  }



}