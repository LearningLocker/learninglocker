<?php namespace Philo\Translate\Console;

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

use Philo\Translate\TranslateManager;

class RemoveCommand extends Command {

	/**
	 * The console command name.
	 *
	 * @var string
	 */
	protected $name = 'translate:remove';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Remove translation from group';

	/**
	 * The translate manager
	 *
	 * @var Philo\Translate\TranslateManager
	 */
	protected $manager;

	/**
	 * Return example usages
	 *
	 * @var Array
	 */
	protected $examples = array();

	/**
	 * Create a new command instance.
	 *
	 * @return void
	 */
	public function __construct(TranslateManager $manager)
	{
		parent::__construct();

		$this->manager = $manager;
	}

	/**
	 * Execute the console command.
	 *
	 * @return void
	 */
	public function fire()
	{
		$group = $this->input->getArgument('group');
		$line  = $this->input->getArgument('line');

		$this->manager->removeLine($group, $line);
		$this->info("Translation '$group.$line' has been removed.");
	}



	/**
	 * Get the console command arguments.
	 *
	 * @return array
	 */
	protected function getArguments()
	{
		return array(
			array('group', InputArgument::REQUIRED, 'Language group'),
			array('line', InputArgument::REQUIRED, 'Line name'),
		);
	}

	/**
	 * Get the console command options.
	 *
	 * @return array
	 */
	protected function getOptions()
	{
		return array();
	}

}
