<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Helpers as Helpers;
use \Locker\Helpers\Exceptions as Exceptions;

class IndexOptions {
  public $options = [];

  public function __construct(array $opts) {
    $this->options = $this->mergeDefaults($opts);
    $this->validate();
  }

  public function getOpt($opt) {
    return $this->options[$opt];
  }

  /**
   * Validates the given options as index options.
   */
  private function validate() {
    $opts = $this->options;

    // Validates types.
    $this->validateOpt($opts, 'agent', 'Agent');
    $this->validateOpt($opts, 'activity', 'IRI');
    $this->validateOpt($opts, 'verb', 'IRI');
    $this->validateOpt($opts, 'registration', 'UUID');
    $this->validateOpt($opts, 'since', 'Timestamp');
    $this->validateOpt($opts, 'until', 'Timestamp');
    $this->validateOpt($opts, 'active', 'Boolean');
    $this->validateOpt($opts, 'voided', 'Boolean');
    $this->validateOpt($opts, 'related_activities', 'Boolean');
    $this->validateOpt($opts, 'related_agents', 'Boolean');
    $this->validateOpt($opts, 'ascending', 'Boolean');
    $this->validateOpt($opts, 'format', 'String');
    $this->validateOpt($opts, 'offset', 'Integer');
    $this->validateOpt($opts, 'limit', 'Integer');
    $this->validateOpt($opts, 'langs', 'Collection');
    $this->validateOpt($opts, 'attachments', 'Boolean');
    $this->validateOpt($opts, 'lrs_id', 'String');

    // Validates values.
    if (!isset($opts['lrs_id'])) throw new Exceptions\Exception('`lrs_id` must be set.');
    if ($opts['offset'] < 0) throw new Exceptions\Exception('`offset` must be a positive interger.');
    if ($opts['limit'] < 1) throw new Exceptions\Exception('`limit` must be a positive interger.');
    if (!in_array($opts['format'], ['exact', 'canonical', 'ids'])) {
      throw new Exceptions\Exception('`format` must be "exact", "canonical", or "ids".');
    }
  }

  private function validateOpt($opts, $opt, $type) {
    $class = '\Locker\XApi\\'.$type;
    if (isset($opts[$opt])) {
      Helpers::validateAtom(new $class($opts[$opt]));
    }
  }

  /**
   * Returns all of the index options set to their default or given value (using the given options).
   * @param [String => mixed] $opts Index options.
   * @return [String => mixed]
   */
  private function mergeDefaults(array $opts) {
    // Merges with defaults.
    $options = array_merge([
      'agent' => null,
      'activity' => null,
      'verb' => null,
      'registration' => null,
      'since' => null,
      'until' => null,
      'active' => true,
      'voided' => false,
      'related_activities' => false,
      'related_agents' => false,
      'ascending' => false,
      'format' => 'exact',
      'offset' => 0,
      'limit' => 0,
      'langs' => [],
      'attachments' => false
    ], $opts);

    // Converts types.
    $options['active'] = $this->convertToBoolean($options['active']);
    $options['voided'] = $this->convertToBoolean($options['voided']);
    $options['related_agents'] = $this->convertToBoolean($options['related_agents']);
    $options['related_activities'] = $this->convertToBoolean($options['related_activities']);
    $options['attachments'] = $this->convertToBoolean($options['attachments']);
    $options['ascending'] = $this->convertToBoolean($options['ascending']);
    $options['limit'] = $this->convertToInt($options['limit']);
    $options['offset'] = $this->convertToInt($options['offset']);

    if ($options['limit'] === 0) $options['limit'] = 100;
    return $options;
  }

  /**
   * Converts the given value to a Boolean if it can be.
   * @param mixed $value
   * @return Boolean|mixed Returns the value unchanged if it can't be converted.
   */
  private function convertToBoolean($value) {
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
  private function convertToInt($value) {
    $converted_value = (int) $value;
    return ($value !== (string) $converted_value) ? $value : $converted_value;
  }
}
