<?php namespace Controllers\xAPI;

use Illuminate\Routing\Controller;
use Controllers\API\BaseController as APIBaseController;

class BaseController extends APIBaseController {

  // Current LRS based on Auth credentials.
  protected $lrs;

  // Filter parameters, HTTP method type.
  protected $params, $CORS, $method;

  /**
   * Checks the request header for correct xAPI version.
   **/
  public function checkVersion() {
    $version = \LockerRequest::header('X-Experience-API-Version');

    if (!isset($version) || substr($version, 0, 4) !== '1.0.') {
      return $this->returnSuccessError(
        false,
        'This is not an accepted version of xAPI.',
        '400'
      );
    }
  }

  /**
   * Selects a method to be called.
   * @return mixed Result of the method.
   */
  public function selectMethod() {
    switch ($this->method) {
      case 'HEAD':
      case 'GET':
        if (\LockerRequest::hasParam($this->identifier)) {
          return $this->show();
        } else {
          return $this->index();
        }
        break;
      case 'PUT':
        return $this->update();
        break;
      case 'POST':
        return $this->store();
        break;
      case 'DELETE':
        return $this->delete();
        break;
    }
  }

  /**
   * Get all of the input and files for the request and store them in params.
   */
  public function setParameters() {
    parent::setParameters();
    $this->method = \LockerRequest::getParam(
      'method',
      \Request::server('REQUEST_METHOD')
    );
  }

}