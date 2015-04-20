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

    // Remove all inactive statements.
    Statement::where('active', '=', false)->delete();

    // Migrates the statements for each LRS.
    foreach ($lrs_collection as $lrs) {
      Statement::where('lrs._id', $lrs->_id)->chunk(500, function ($statements) use ($lrs) {
        $statements_array = [];

        // Sets `active` and `voided` properties.
        // Ensures that statement is an associative array.
        $statements = $statements->each(function ($statement) {
          $statement->voided = isset($statement->voided) ? $statement->voided : false;
          $statement->active = isset($statement->active) ? $statement->active : true;
          $statement->save();
          $statements_array[] = (array) json_decode($statement->toJSON());
        });

        // Uses the repository to migrate the statements.
        $repo = App::make('Locker\Repository\Statement\EloquentVoider');
        $repo->updateReferences($statements_array, $lrs);
        $repo->voidStatements($statements_array, $lrs);

        // Outputs status.
        $statement_count = $statements->count();
        $this->info("Migrated $statement_count statements in `{$lrs->title}`.");
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
