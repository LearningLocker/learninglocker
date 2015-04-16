<?php namespace Tests\Repos\Statement;

class IndexOptionsTest extends OptionsTest {
  protected $options_class = '\Locker\Repository\Statement\IndexOptions';
  protected $overwrite_opts = [
    'lrs_id' => '1',
  ];
  protected $default_opts = [
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
    'limit' => 100,
    'langs' => [],
    'attachments' => false,
    'lrs_id' => '1'
  ];
  protected $valid_opts = [
    'activity' => 'http://www.example.com',
    'verb' => 'http://www.example.com',
    'registration' => '93439880-e35a-11e4-b571-0800200c9a66',
    'since' => '2015-01-01T00:00Z',
    'until' => '2015-01-01T00:00Z',
    'active' => true,
    'voided' => true,
    'related_activities' => true,
    'related_agents' => true,
    'ascending' => true,
    'format' => 'exact',
    'offset' => 0,
    'limit' => 1,
    'langs' => [],
    'attachments' => true,
    'lrs_id' => '1'
  ];
  protected $invalid_opts = [
    'activity' => 'zz.example.com',
    'verb' => 'zz.example.com',
    'registration' => '93439880-e35a-11e4-b571-0800200c9a66Z',
    'since' => '2015-01-01T00:00ZYX',
    'until' => '2015-01-01T00:00ZYX',
    'active' => 'invalid',
    'voided' => 'invalid',
    'related_activities' => 'invalid',
    'related_agents' => 'invalid',
    'ascending' => 'invalid',
    'format' => 'invalid',
    'offset' => -1,
    'limit' => -1,
    'langs' => 'invalid',
    'attachments' => 'invalid',
    'lrs_id' => true
  ];

  public function setup() {
    parent::setup();
    $this->valid_opts['agent'] = (object) ['mbox' => 'mailto:test@example.com'];
    $this->invalid_opts['agent'] = (object) ['mbox' => 'test@example.com'];
  }

  public function testValidCanonicalFormat() {
    try {
      $start_opts = $this->valid_opts;
      $start_opts['format'] = 'canonical';
      $end_opts = new $this->options_class($start_opts);

      foreach ($end_opts->options as $key => $val) {
        $this->assertEquals($start_opts[$key], $val);
      }
    } catch (\Exception $ex) {
      \Log::error($ex);
      $this->assertEquals(false, true, $ex->getMessage());
    }
  }

  public function testValidIdsFormat() {
    try {
      $start_opts = $this->valid_opts;
      $start_opts['format'] = 'ids';
      $end_opts = new $this->options_class($start_opts);

      foreach ($end_opts->options as $key => $val) {
        $this->assertEquals($start_opts[$key], $val);
      }
    } catch (\Exception $ex) {
      \Log::error($ex);
      $this->assertEquals(false, true, $ex->getMessage());
    }
  }

}
