<?php namespace locker;

class Request {

  // Canonicalization of common params to improve maintenance and reduce bugs.
  const authParam = 'Authorization';
  const authUser = 'user';
  const authPass = 'password';

  // Stores/caches params.
  protected $params = null;

  /**
   * Gets all params (merges payload params with request params).
   * @return AssocArray params.
   */
  public function getParams() {
    // If no params were cached, get them.
    if ($this->params === null || count($this->params) < 1 || \App::environment() === 'testing') {
      $requestParams = \Request::all();
      $payloadParams = $this->getPayloadParams();

      // Merges params if they are both arrays.
      if (is_array($requestParams) && is_array($payloadParams)) {
        $this->params = array_merge($requestParams, $payloadParams);
      } else {
        $this->params = $requestParams;
      }
    }

    // Return the cached params.
    return $this->params;
  }

  /**
   * Gets the data stored in the request payload.
   * @return AssocArray params from the payload.
   */
  public function getPayloadParams() {
    $payloadParams = [];
    parse_str($this->getPayload(), $payloadParams); // Parse the payload into an AssocArray.
    $payloadParams = json_decode(json_encode($payloadParams), true);
    return $payloadParams;
  }

  /**
   * Gets the user from the basic auth.
   * @return String user in the basic auth.
   */
  public function getUser() {
    return \Request::getUser() ?: $this->getAuth()[self::authUser];
  }

  /**
   * Gets the password from the basic auth.
   * @return String password in the basic auth.
   */
  public function getPassword() {
    return \Request::getPassword() ?: $this->getAuth()[self::authPass];
  }

  /**
   * Gets a header from the request headers.
   * @param  $key Header to be returned.
   * @param  $default Value to be returned if the header is not set.
   * @return mixed Value of the header.
   */
  public function header($key, $default=null) {
    $value = \Request::header($key);

    // If the key is set in the headers then return it.
    if (isset($value)) {
      return $value;
    }

    // Else return it from the payload.
    else {
      return $this->getParam($key, $default);
    }
  }

  /**
   * Gets the stored/cached params.
   * @return AssocArray Stored/cached params.
   */
  public function all() {
    return $this->getParams();
  }

  /**
   * Gets the stored/cached params.
   * @return AssocArray Stored/cached params.
   */
  public function getPayload() {
    return \Request::getContent();
  }

  /**
   * Gets a param from the stored/cached params.
   * @param  String $key Param to be retrieved.
   * @param  mixed $default Value to be returned if the param is not set.
   * @return mixed Value of the param.
   */
  public function getParam($key, $default = null) {
    // If the key has been set then return its value.
    if ($this->hasParam($key)) {
      return $this->getParams()[$key];
    }

    // If the key has not been set then return the default value.
    else {
      return $default;
    }
  }

  public function getContent() {
    return $this->getParam('content', \Request::getContent());
  }

  /**
   * Determines if the param is set.
   * @param  String  $key Param to be checked.
   * @return boolean True if the param exists, false if it doesn't.
   */
  public function hasParam($key) {
    return isset($this->getParams()[$key]);
  }

  /**
   * Gets the authentication details from the stored/cached params.
   * @return AssocArray Basic auth details.
   */
  private function getAuth() {
    $result = [];

    // If the basic auth details are set, decode and return them.
    if ($this->hasParam(self::authParam)) {
      $auth = explode(' ', $this->getParam(self::authParam));
      $decoded = base64_decode($auth[1]);
      $auth_parts = explode(':', $decoded);

      $result[self::authUser] = $auth_parts[0];
      $result[self::authPass] = $auth_parts[1];
    }

    // If the basic auth details are not set return a null user and password.
    else {
      $result[self::authUser] = null;
      $result[self::authPass] = null;
    }

    return $result;
  }
}
