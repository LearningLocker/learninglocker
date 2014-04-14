<?php namespace Locker\Repository\OAuthApp;

use OAuthApp;

class EloquentOAuthAppRepository implements OAuthAppRepository {

  /**
  * App
  */
  protected $app;

  /**
   * Construct
   *
   * @param App $app
   */
  public function __construct( OAuthApp $app ){

    $this->app = $app;

  }

  public function find($id){
    return $this->app->find($id);
  }

  public function all(){
    if( \Auth::user()->role == 'super' ){
      return $this->app->all();
    }else{
      return $this->app->where('owner._id', \Auth::user()->_id)->get();
    }
  }

  public function create( $input ){

    $user             = \Auth::user();
    $app              = new OAuthApp;
    $app->name        = $input['name'];
    $app->description = $input['description'];
    $app->website     = $input['website'];
    $app->callbackurl = $input['callback'];
    $app->rules       = $input['rules'];
    $app->client_id   = \app\locker\helpers\Helpers::getRandomValue();
    $app->secret      = \app\locker\helpers\Helpers::getRandomValue();
    $app->organisation = array('name'    => $input['organisation'] ? $input['organisation'] : '',
                               'website' => $input['org_url'] ? $input['org_url'] : '');
    $app->owner       = array('_id'   => $user->_id,
                              'email' => $user->email,
                              'name'  => $user->name, 
                              'role'  => $user->role );

    $app->save() ? $result = true : $return = false;

    $this->oauthDetails( $app->_id, $input['name'], $app->client_id, $app->secret, 1, $input['callback'] );

    return $result;
    
  }

   public function update( $id, $input ){

    $app              = $this->app->find( $id );
    $app->name        = $input['name'];
    $app->description = $input['description'];
    $app->website     = $input['website'];
    $app->callbackurl = $input['callback'];
    $app->organisation = array('name'    => $input['organisation'] ? $input['organisation'] : '',
                               'website' => $input['org_url'] ? $input['org_url'] : '');

    $app->save() ? $result = true : $return = false;

    //@todo 
    $this->oauthEditDetails( $app->client_id, $input['name'], $input['callback'] );

    return $result;
    
  }

  public function delete($id){
    $app = $this->app->find( $id );
    //@todo delete from mysql tables based on client_id
    $app->delete();
  }

  /**
   * @todo save scope for the app e.g. read only, read and write or read / write / manage
   *
   **/
  private function oauthDetails( $app_id, $name, $client_id, $secret, $approve=1, $callback ){
   
    \DB::connection('mysql')->table('oauth_clients')->insert(
        array('id'           => $client_id, 
              'secret'       => $secret,
              'name'         => $name,
              'app_id'       => $app_id, 
              'auto_approve' => $approve)
      );

    \DB::connection('mysql')->table('oauth_client_endpoints')->insert(
        array('client_id'    => $client_id,
              'redirect_uri' => $callback)
      );

  }

  private function oauthEditDetails( $client_id, $name, $callback ){
   
    \DB::connection('mysql')
    ->table('oauth_clients')
    ->where('id', $client_id)
    ->update( array('name' => $name) );

    \DB::connection('mysql')
    ->table('oauth_client_endpoints')
    ->where('client_id', $client_id)
    ->update( array('redirect_uri' => $callback) );

  }

}