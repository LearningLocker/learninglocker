<?php namespace Locker\Helpers\Exceptions;

class Exception extends \Exception {
  public function __construct($message = '', $status_code = 400, $ex = null) {
    $this->status_code = $status_code;
    parent::__construct($message, 0, $ex);
  }

  public function getStatusCode() {
    return $this->status_code;
  }
}

class Validation extends Exception {
  protected $errors = [];

  /**
   * Constructs a new Error with a $errors.
   * @param string $message
   */
  public function __construct($errors) {
    \Locker\XApi\Helpers::checkType('errors', 'array', $errors);
    $this->errors = $errors;
    $errors = array_map(function ($error) {
      return (string) $error;
    }, $errors);
    parent::__construct(json_encode($errors), 400);
  }

  public function getErrors() {
    return $this->errors;
  }
}

class FailedPrecondition extends Exception {
  public function __construct($message) {
    parent::__construct($message, 412);
  }
}

class Conflict extends Exception {
  public function __construct($message) {
    parent::__construct($message, 409);
  }
}

class NotFound extends Exception {
  public function __construct($id, $class) {
    parent::__construct(trans('api.errors.not_found', [
      'id' => $id,
      'class' => $class
    ]), 404);
  }
}
