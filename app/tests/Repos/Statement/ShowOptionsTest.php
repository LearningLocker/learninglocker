<?php namespace Tests\Repos\Statement;

class ShowOptionsTest extends OptionsTest {
  protected $options_class = '\Locker\Repository\Statement\ShowOptions';
  protected $overwrite_opts = [
    'lrs_id' => '1',
  ];
  protected $default_opts = [
    'lrs_id' => '1',
    'voided' => false,
    'active' => true
  ];
  protected $valid_opts = [
    'lrs_id' => '1',
    'voided' => true,
    'active' => false
  ];
  protected $invalid_opts = [
    'lrs_id' => true,
    'voided' => 'false',
    'active' => 'true'
  ];

}
