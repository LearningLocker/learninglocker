<?php

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class ConvertTimestamp extends Command {

  /**
   * The console command name.
   *
   * @var string
   */
  protected $name = 'timestamp:convert';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Create a new key in the document root that is a copy of timestamp in MongoData format.';

  /**
   * Create a new command instance.
   *
   * @return void
   */
  public function __construct()
  {
    parent::__construct();
  }

  /**
   * Execute the console command.
   *
   * Loop through all statements and create a new key in the document route.
   * This key 'convertedTimestamp' is the same as the statement timestamp but in a 
   * data format the MongoDB aggregation function needs.
   * 
   * @return string
   */
  public function fire()
  {
    Statement::chunk(1000, function($statements){
      foreach ($statements as $s){
        $s->timestamp = new \MongoDate(strtotime($s->statement['timestamp']));
        $s->save();
      }
      $this->info(count($statements) . ' converted.');
    });

    $this->info('All finished, hopefully!');
  }


}
