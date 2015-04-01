<?php

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class ReportMigrateCommand extends Command {

  /**
   * The console command name.
   *
   * @var string
   */
  protected $name = 'll:migrate-reports';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Converts phase 1 reports to phase 2.';

  /**
   * Create a new command instance.
   *
   * @return void
   */
  public function __construct() {
    parent::__construct();
  }

  private static function migrateQuery(array $query) {
    $output = [];

    foreach ($query as $key => $value) {
      if (is_array($value)) {
        $value = array_map('urldecode', $value);
      }

      $new = \Locker\Helpers\Helpers::replaceFullStopInKeys($key);
      $output[$new] = $value;
    }

    return $output;
  }

  /**
   * Execute the console command.
   *
   * @return mixed
   */
  public function fire() {
    $reports = Report::get();
    foreach ($reports as $report) {
      $report->query = self::migrateQuery((array) $report->query);
      $report->save();
    }
    $this->info('Migrated ' . count($reports) . ' reports.');
  }

  /**
   * Get the console command arguments.
   *
   * @return array
   */
  protected function getArguments() {
    return [];
  }

  /**
   * Get the console command options.
   *
   * @return array
   */
  protected function getOptions() {
    return [];
  }

}
