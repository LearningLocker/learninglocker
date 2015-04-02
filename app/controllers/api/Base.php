<?php namespace Controllers\API;

use \Illuminate\Routing\Controller;
use \Response as IlluminateResponse;
use \LockerRequest as LockerRequest;
use \Config as Config;
use \Request as Request;
use \Route as Route;
use \DB as DB;
use \Locker\Repository\Lrs\EloquentLrsRepository as LrsRepository;
use \Lrs as Lrs;
use \Client as Client;

abstract class Base extends Controller {

  /**
   * Constructs a new base controller.
   */
  public function __construct() {
    $this->beforeFilter('@getLrs');
  }

  /**
   * Gets the options from the request.
   * @return [String => Mixed]
   */
  protected function getOptions() {
    return [
      'lrs_id' => $this->lrs->_id
    ];
  }

  protected function returnJson($data) {
    $params = LockerRequest::getParams();
    if (LockerRequest::hasParam('filter')) {
      $params['filter'] = json_decode(LockerRequest::getParam('filter'));
    }

    return IlluminateResponse::json([
      'version' => Config::get('api.using_version'),
      'route' => Request::path(),
      'url_params' => Route::getCurrentRoute()->parameters(),
      'params' => $params,
      'data' => $data,
      'debug' => !Config::get('app.debug') ? trans('api.info.trace') : DB::getQueryLog()
    ]);
  }
  
  /**
   * Get the LRS details based on Auth credentials
   **/
  public function getLrs() {
    $key = LockerRequest::getUser();
    $secret = LockerRequest::getPassword();
    $lrs = LrsRepository::checkSecret(Lrs::where('api.basic_key', $key)->first(), $secret);

    //if main credentials not matched, try the additional credentials
    if ($lrs == null) {
      $client = LrsRepository::checkSecret(Client::where('api.basic_key', $key)->first(), $secret);

      if ($client != null) {
        $lrs = Lrs::find($client->lrs_id);
      } else {
        throw new Exceptions\Exception('Unauthorized request.', 401);
      }
    }
		   
    $this->lrs = $lrs;
  }


}