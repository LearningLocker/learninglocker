<?php namespace Philo\Translate\Console;

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

use Philo\Translate\TranslateManager;
use File, Lang;

class DiggCommand extends Command {

	/**
	 * The console command name.
	 *
	 * @var string
	 */
	protected $name = 'translate:digg';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Try to digg all missing translation from application [BETA]';

	/**
	 * The translation manager
	 *
	 * @var Philo\Translate\TranslateManager
	 */
	protected $manager;

	/**
	 * The progress helper helper set.
	 *
	 * @var \Symfony\Component\Console\Helper\ProgressHelper
	 */
	protected $progress;

	/**
	 * Array containing missing translations
	 *
	 * @var array
	 */
	protected $missing = array();

	/**
	 * Create a new command instance.
	 *
	 * @return void
	 */
	public function __construct(TranslateManager $manager)
	{
		parent::__construct();
		$this->manager  = $manager;
	}

	/**
	 * Execute the console command.
	 *
	 * @return void
	 */
	public function fire()
	{
		$htmlentities = !$this->input->getOption('no-entities');
		$this->info("It's time to DIGG for some translations!");
		$this->info(' ');
		foreach ($this->manager->getDiggFiles() as $file) {

			$path = str_replace(base_path().'/', '', $file);
			$this->comment("Digging translations for $path");

			foreach ($this->getTranlations($file) as $translate) {

				if( ! $translate['valid'] and ! $this->confirm('Translation "' . $translate['lang_query'] . '" seems wrong. Want to try to translate it anyway? [yes|no]')) {
					continue;
				}

				foreach($this->manager->getLanguages() as $language)
				{
					$lang_query = array_get($translate, 'lang_query');
					$parameters = array_get($translate, 'parameters');
					$group      = array_get($translate, 'group');
					$line       = array_get($translate, 'line');

					if(Lang::get($lang_query, $parameters) == $lang_query)
					{
						if(is_null($translation = $this->ask("Translate '$lang_query'" . ( ! empty($parameters) ? " [" . implode(',', $parameters) . "]" : null) . " in " . strtoupper($language) . ": "))) continue;
						$this->manager->setLanguage($language)->addLine($group, $line, $translation, $htmlentities);
					}
				}
			}
		}
	}

	/**
	 * Parse all translations from files
	 *
	 * @return array
	 * @author
	 **/
	public function getTranlations($file)
	{
		$data = File::get($file);

		//	Try to pick up all Lang functions from file
		preg_match_all('/(trans|Lang::get)\(([^\)]*)\)/imU', $data, $matches, PREG_PATTERN_ORDER);

		//	return empty array if none found
		if(empty($matches[2])) {
			return array();
		}

		//	return unique translations
		$files = array_unique($matches[2]);

		//	clean up
		foreach ($files as &$item) {

			//	Set parameters [], if we have parameters on our translatios, fill it up next
			$parameters = array();

			//	separate parameters path from parameters
			preg_match('/,\s*\t*(\[.*\])/i', $item, $parts);
			if( ! empty($parts)) {

				$item        = str_replace($parts[0], '', $item);
				$_parameters = $parts[1];

				preg_match_all('/("|\')([^\'"]*)("|\')\s*\t*\n*\r*=\s*>/iU', $_parameters, $keys);

				if(empty($keys[2])) {
					$parameters = array_fill_keys($keys[2], 'val');
				}
			}

			$_i = trim(str_replace(array('\'', '"'), '', $item));

			$item = array(
				'lang_query'	=> $_i,
				'valid'			=> (preg_match('/[^0-9a-zA-Z\._]/', $_i) == 0),
				'group' 		=> substr($_i, 0, strpos($_i, '.')),
				'line' 			=> substr($_i, strpos($_i, '.')+1),
				'parameters' 	=> $parameters,
			);
		}

		return $files;
	}

	/**
	 * Get the console command arguments.
	 *
	 * @return array
	 */
	protected function getArguments()
	{
		return array();
	}

	/**
	 * Get the console command options.
	 *
	 * @return array
	 */
	protected function getOptions()
	{
		return array(
			array('no-entities', null, InputOption::VALUE_NONE, 'Add translation without converting characters to entities'),
		);
	}

}
