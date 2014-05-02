<?php namespace Locker\Repository\Client;

use Client;

class EloquentClientRepository implements ClientRepository {

  /**
  * @var $client
  */
  protected $client;

  /**
   * Construct
   *
   * @param $client
   */
  public function __construct(Client $client){
    $this->client = $client;
  }

  public function all(){
    return $this->client->all();
  }

  public function find($id){
    return $this->client->find($id);
  }

  public function validate($data){
    $client = new Client;
    return $client->validate( $data );
  }

  public function create( $input ){

    $user             = \Auth::user();
    $client              = new Client;
    $client->title       = $input['title'];
    $client->description = $input['description'];
    $client->api         = array('basic_key'    => \app\locker\helpers\Helpers::getRandomValue(),
                              'basic_secret' => \app\locker\helpers\Helpers::getRandomValue());

    $client->save() ? $result = true : $return = false;

    //fire a create client event if it worked and saved
    if( $result )
      \Event::fire('user.create_client', array('user' => $user, 'client' => $client));

    return $result;
    
  }

  public function update($id, $input){

    $client = $this->find($id);

    $client->title       = $input['title'];
    $client->description = $input['description'];
   
    $client->save();
      
    return $client;

  }

  public function delete($id){
    
    $client = $this->find($id);

    return $client->delete();
  }

}