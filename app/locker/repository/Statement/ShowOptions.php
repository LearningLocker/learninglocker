<?php namespace Locker\Repository\Statement;

class ShowOptions extends Options {
  protected $defaults = [
    'voided' => false,
    'active' => true
  ];
  protected $types = [
    'lrs_id' => 'String',
    'voided' => 'Boolean',
    'active' => 'Boolean',
    'scopes' => ['String'],
    'client' => null
  ];
}
