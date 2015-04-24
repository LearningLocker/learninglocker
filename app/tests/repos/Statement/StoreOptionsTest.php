<?php namespace Tests\Repos\Statement;

class StoreOptionsTest extends OptionsTest {
  protected $options_class = '\Locker\Repository\Statement\StoreOptions';
  protected $overwrite_opts = [
    'lrs_id' => '1',
  ];
  protected $default_opts = [
    'lrs_id' => '1',
  ];
  protected $valid_opts = [
    'lrs_id' => '1',
  ];
  protected $invalid_opts = [
    'lrs_id' => true
  ];

  public function setup() {
    parent::setup();
    $this->overwrite_opts['authority'] = (object) ['mbox' => 'mailto:test@example.com'];
    $this->default_opts['authority'] = $this->overwrite_opts['authority'];
    $this->valid_opts['authority'] = $this->overwrite_opts['authority'];
    $this->invalid_opts['authority'] = (object) ['mbox' => 'test@example.com'];
  }

}
