<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Helpers as Helpers;
use \Locker\Helpers\Exceptions as Exceptions;

class IndexOptions extends Options {
  protected $defaults = [
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
  ];
  protected $types = [
    'agent' => 'Actor',
    'activity' => 'IRI',
    'verb' => 'IRI',
    'registration' => 'UUID',
    'since' => 'Timestamp',
    'until' => 'Timestamp',
    'active' => 'Boolean',
    'voided' => 'Boolean',
    'related_activities' => 'Boolean',
    'related_agents' => 'Boolean',
    'ascending' => 'Boolean',
    'format' => 'String',
    'offset' => 'Integer',
    'limit' => 'Integer',
    'langs' => ['Language'],
    'attachments' => 'Boolean',
    'lrs_id' => 'String',
    'scopes' => ['String'],
    'client' => null
  ];

  /**
   * Validates the given options as index options.
   * @param [String => Mixed] $opts
   * @return [String => Mixed]
   */
  protected function validate($opts) {
    $opts = parent::validate($opts);

    // Validates values.
    if (!isset($opts['lrs_id'])) throw new Exceptions\Exception('`lrs_id` must be set.');
    if ($opts['offset'] < 0) throw new Exceptions\Exception('`offset` must be a positive interger.');
    if ($opts['limit'] < 1) throw new Exceptions\Exception('`limit` must be a positive interger.');
    if (!in_array($opts['format'], ['exact', 'canonical', 'ids'])) {
      throw new Exceptions\Exception('`format` must be "exact", "canonical", or "ids".');
    }

    return $opts;
  }

  /**
   * Returns all of the index options set to their default or given value (using the given options).
   * @param [String => mixed] $opts Index options.
   * @return [String => mixed]
   */
  protected function mergeDefaults(array $opts) {
    // Merges with defaults.
    $opts = parent::mergeDefaults($opts);

    // Converts types.
    $opts['active'] = $this->convertToBoolean($opts['active']);
    $opts['voided'] = $this->convertToBoolean($opts['voided']);
    $opts['related_agents'] = $this->convertToBoolean($opts['related_agents']);
    $opts['related_activities'] = $this->convertToBoolean($opts['related_activities']);
    $opts['attachments'] = $this->convertToBoolean($opts['attachments']);
    $opts['ascending'] = $this->convertToBoolean($opts['ascending']);
    $opts['limit'] = $this->convertToInt($opts['limit']);
    $opts['offset'] = $this->convertToInt($opts['offset']);

    if ($opts['limit'] === 0) $opts['limit'] = 100;
    return $opts;
  }
}
