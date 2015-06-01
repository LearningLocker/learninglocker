<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Helpers as Helpers;
use \Locker\Helpers\Exceptions as Exceptions;

abstract class Options {
  public $options = [];
  protected $defaults = [];
  protected $types = [];

  public function __construct(array $opts) {
    $this->options = $this->mergeDefaults($opts);
    $this->options = $this->validate($this->options);
  }

  /**
   * Gets an options.
   * @param String $opt Option name.
   * @return Mixed
   */
  public function getOpt($opt) {
    return $this->options[$opt];
  }

  /**
   * Validates the given options as index options.
   * @param [String => Mixed] $opts
   * @return [String => Mixed]
   */
  protected function validate($opts) {
    foreach ($opts as $key => $value) {
      if ($value !== null && $this->types[$key] !== null) {
        if (is_array($this->types[$key])) {
          $class = '\Locker\XApi\\'.$this->types[$key][0];
          if (!is_array($value)) {
            throw new Exceptions\Exception("$key must be an array.");
          }
          foreach ($value as $item) {
            Helpers::validateAtom(new $class($item));
          }
        } else {
          $class = '\Locker\XApi\\'.$this->types[$key];
          Helpers::validateAtom(new $class($value));
        }
      }
    }

    return $opts;
  }

  /**
   * Returns all of the index options set to their default or given value (using the given options).
   * @param [String => mixed] $opts Index options.
   * @return [String => mixed]
   */
  protected function mergeDefaults(array $opts) {
    return array_merge($this->defaults, $opts);
  }

  /**
   * Converts the given value to a Boolean if it can be.
   * @param mixed $value
   * @return Boolean|mixed Returns the value unchanged if it can't be converted.
   */
  protected function convertToBoolean($value) {
    if (is_string($value)) $value = strtolower($value);
    if ($value === 'true') return true;
    if ($value === 'false') return false;
    return $value;
  }

  /**
   * Converts the given value to a Integer if it can be.
   * @param mixed $value
   * @return Integer|mixed Returns the value unchanged if it can't be converted.
   */
  protected function convertToInt($value) {
    $converted_value = (int) $value;
    return ($value !== (string) $converted_value) ? $value : $converted_value;
  }
}
