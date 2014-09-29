<?php namespace Controllers\xAPI;

use Illuminate\Routing\Controller;
use Controllers\API\BaseController as APIBaseController;

class BaseController extends APIBaseController {

  /**
   * Current LRS based on Auth credentials
   **/
  protected $lrs;

  /**
   * Filter parameters, HTTP method type
   **/
  protected $params, $CORS, $method;

  /**
   * Check request header for correct xAPI version
   **/
  public function checkVersion( $route, $request ){

    //should be X-Experience-API-Version: 1.0.0 or 1.0.1 (can accept 1.0), reject everything else.
    $version = \LockerRequest::header('X-Experience-API-Version');

    if( !isset($version) || ( $version < '1.0.0' || $version > '1.0.99' ) && $version != '1.0' ){
      return $this->returnSuccessError( false, 'This is not an accepted version of xAPI.', '400' );
    }

  }

  /**
   * Get all of the input and files for the request and store them in params.
   *
   */
  public function setParameters(){
    $this->params = \LockerRequest::all();
    $this->CORS = isset($this->params['method']);
    $this->method = $this->CORS ? $this->params['method'] : \Request::server('REQUEST_METHOD');

    $this->params['content'] = \LockerRequest::getContent();
  }

}