<?php namespace Controllers\xAPI;

use Illuminate\Routing\Controller;
use Controllers\API\BaseController as APIBaseController;

class BaseController extends APIBaseController {

  // Sets constants for status codes.
  const OK = 200;
  const NO_CONTENT = 204;
  const NO_AUTH = 403;
  const CONFLICT = 409;

  // Defines properties to be set by the constructor.
  protected $params, $method, $lrs;

  /**
   * Constructs a new xAPI controller.
   */
  public function __construct() {
    $this->setMethod();
    $this->getLrs();
  }

  /**
   * Selects a method to be called.
   * @return mixed Result of the method.
   */
  public function selectMethod() {
    switch ($this->method) {
      case 'HEAD':
      case 'GET': return $this->get();
      case 'PUT': return $this->update();
      case 'POST': return $this->store();
      case 'DELETE': return $this->destroy();
    }
  }

  public function get() {
    return \LockerRequest::hasParam($this->identifier) ? $this->show() : $this->index();
  }

  /**
   * Checks the request header for correct xAPI version.
   **/
  protected function checkVersion() {
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
   * Sets the method (to support CORS).
   */
  protected function setMethod() {
    parent::setParameters();
    $this->method = \LockerRequest::getParam(
      'method',
      \Request::server('REQUEST_METHOD')
    );
  }

  /**
   * Constructs a error response with a $message and optional $statusCode.
   * @param string $message
   * @param integer $statusCode
   */
  public static function errorResponse($message = '', $statusCode = 400) {
    return \Response::json([
      'error' => true, // @deprecated
      'success' => false,
      'message' => $message
    ], $statusCode);
  }
}
