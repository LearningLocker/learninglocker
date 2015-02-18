<?php namespace app\locker\helpers;

class ValidationException extends \Exception {
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
    $this->message = json_encode($errors);
  }

  public function getErrors() {
    return $this->errors;
  }
}
class FailedPrecondition extends \Exception {}
class Conflict extends \Exception {}

class NotFound extends \Exception {
  public function __construct($id, $class) {
    parent::__construct(trans('api.errors.not_found', [
      'id' => $id,
      'class' => $class
    ]));
  }
}