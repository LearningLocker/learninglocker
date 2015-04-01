<?php namespace Locker\Repository\Client;

use \Locker\Helpers\Exceptions as Exceptions;
use \Client;

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
    $client->api         = array('basic_key'    => \Locker\Helpers\Helpers::getRandomValue(),
                              'basic_secret' => \Locker\Helpers\Helpers::getRandomValue());
  	$client->lrs_id = $input['lrs_id'];

  	$client->authority = array(
  		'name' => 'client',
      'mbox' => 'mailto:hello@learninglocker.net'
  	);

    $client->save() ? $result = $client : $return = false;

    //fire a create client event if it worked and saved
    if( $result )
      \Event::fire('user.create_client', array('user' => $user, 'client' => $client));

    return $result;

  }

  public function update($id, $input){

    $client = $this->find($id);

	  $authority = $client->authority;

    $authority['name'] = $input['name'];

  	//clear all previously saved ifis
  	unset ($authority['mbox']);
  	unset ($authority['mbox_sha1sum']);
  	unset ($authority['openid']);
  	unset ($authority['account']);

  	switch ($input['ifi']) {
  		case 'mbox' :
  			$authority['mbox'] = 'mailto:'.$input['mbox'];
  			break;
  		case 'mbox_sha1sum' :
  			$authority['mbox_sha1sum'] = $input['mbox_sha1sum'];
  			break;
  		case 'openid' :
  			$authority['openid'] = $input['openid'];
  			break;
  		case 'account':
  			$authority['account'] = array(
  				'name' => $input['account_name'],
  				'homePage' => $input['account_homePage']
  			);
  			break;
  	}

    $errors = \Locker\XApi\Actor::createFromJson(json_encode($authority))->validate();
    if (count($errors) > 0) {
      throw new Exceptions\Validation(array_map(function ($error) {
        return (string) $error->addTrace('authority');
      }, $errors));
    }

  	$client->authority = $authority;

    $client->description = $input['description'];

    $client->save();

    return $client;

  }

  public function delete($id){

    $client = $this->find($id);

    return $client->delete();
  }

}
