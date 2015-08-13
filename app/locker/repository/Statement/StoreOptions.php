<?php namespace Locker\Repository\Statement;

class StoreOptions extends Options {
  protected $defaults = [];
  protected $types = [
    'lrs_id' => null,
    'authority' => 'Authority',
    'scopes' => ['String'],
    'client' => null
  ];
}
