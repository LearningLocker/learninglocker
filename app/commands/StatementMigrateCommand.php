<?php

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class StatementMigrateCommand extends Command {

  /**
   * The console command name.
   *
   * @var string
   */
  protected $name = 'll:migrate-statements';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Adds `active` and `voided` properties.';

  /**
   * Create a new command instance.
   *
   * @return void
   */
  public function __construct() {
    parent::__construct();
  }

  /**
   * Execute the console command.
   *
   * @return mixed
   */
  public function fire() {
    $lrs_collection = (new Lrs)->get();

    foreach ($lrs_collection as $lrs) {
      Statement::where('lrs._id', $lrs->_id)->chunk(1000, function ($statements) use ($lrs) {
        $repo = App::make('Locker\Repository\Statement\EloquentStatementRepository');
        $statements = json_decode($statements->toJSON());
        $statements = array_map(function ($statement) {
          $statement->voided = $statement->voided ?: false;
          $statement->active = $statement->active ?: true;
          $statement->save();
          return (array) $statement;
        }, $statements);
        $repo->updateReferences($statements, $lrs);
        $repo->voidStatements($statements, $lrs);
        $repo->activateStatements($statements, $lrs);
        $this->info('Migrated ' . count($statements) . ' statements.');
      });
    }

    $this->info('All statements migrated.');
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
