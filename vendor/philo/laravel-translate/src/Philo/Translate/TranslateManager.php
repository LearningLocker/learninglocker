<?php namespace Philo\Translate;

use Illuminate\Filesystem;
use InvalidArgumentException;
use App, Config, File, Lang, Carbon\Carbon;

class TranslateManager {

	protected $language;
	protected $languages         = array();
	protected $loaded            = array();
	protected $languagesBasePath = 'app/lang/';
	protected $namespace;

	public function __construct()
	{
		$this->getLanguages();
	}

	/**
	 * Get path to languages folder
	 * @param  string $append
	 * @return string
	 */
	public function getLangPath($append = null)
	{
		return base_path($this->languagesBasePath . $append);
	}

	/**
	 * Set languages folder path
	 * @param  string $path
	 * @return void
	 */
	public function setLangPath($path)
	{
		$this->languagesBasePath = $path;

		// Reset languages
		$this->languages = array();
		$this->getLanguages();
	}

	/**
	 * Prepare manager to work with workbench
	 * @param  string $bench
	 * @return void
	 */
	public function workbench($bench)
	{
		list($vendor, $namespace) = explode('/', $bench);
		$this->namespace = $namespace;
		$this->setLangPath('workbench' . DIRECTORY_SEPARATOR . $bench . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . 'lang' . DIRECTORY_SEPARATOR);
	}

	/**
	 * Add language to current instance
	 * @param string $abbreviation
	 */
	public function addLanguage($abbreviation)
	{
		if(in_array($abbreviation, $this->languages)) return;
		array_push($this->languages, $abbreviation);
	}

	/**
	 * Return all available languages
	 * @return array
	 */
	public function getLanguages()
	{
		if( ! empty($this->languages) ) return $this->languages;

		$directories = App::make('Finder')->directories()->in($this->getLangPath());

		// Since we always want the default language to be processed first
		// we add it manually so it will be ignored when looping through all languages
		$this->addLanguage(App::getLocale());

		foreach ($directories as $directory) {
			$this->addLanguage($directory->getfileName());
		}

		return $this->languages;
	}

	/**
	 * Set manager language
	 * @param string $language
	 */
	public function setLanguage($language)
	{
		$this->language = $language;
		App::setLocale($this->language);

		return $this;
	}

	/**
	 * Add new line to translation
	 * @param string $group
	 * @param string $line
	 * @param string $translation
	 * @param boolean $htmlentities
	 */
	public function addLine($group, $line, $translation, $htmlentities)
	{
		$lines       = $this->loadGroup($group);
		$translation = ($htmlentities) ? htmlentities($translation) : $translation;

		array_set($lines, $line, $translation);
		$this->writeToFile($group, $lines);

		return $this;
	}

	/**
	 * Remove line from namespace
	 * @param  string $group
	 * @param  string $line
	 * @return void
	 */
	public function removeLine($group, $line)
	{
		foreach ($this->languages as $language) {

			$this->setLanguage($language);
			$this->loadGroup($group);

			array_forget($this->loaded, "$language.$group.$line");
			$this->writeToFile($group, array_get($this->loaded, "$language.$group", array()));
		}

		return $this;
	}

	/**
	 * Get variables from translation
	 * @param  string $line
	 * @return array
	 */
	public function getTranslationVariables($line)
	{
		preg_match_all('/:(\S\w*)/', $line, $matches);
		return (isset($matches[1])) ? $matches[1] : array();
	}

	/**
	 * Find line occurrence in given path
	 * @param  string $group
	 * @param  string $line
	 * @return intiger
	 */
	public function findLineCount($group, $line)
	{
		return App::make('Finder')->files()->name('*.php')->in(app_path())->exclude($this->getIgnoredFolders())->contains("$group.$line")->count();
	}

	/**
	 * Return all files within a language
	 * @return array
	 */
	public function getLanguageFiles()
	{
		$files   = array();
		$results = App::make('Finder')->files()->name('*.php')->in($this->getLanguagePath());
		$ignore  = $this->getIgnoredFiles();

		foreach($results as $result)
		{
			$group = $result->getBasename('.php');
			if(in_array($group, $ignore)) continue;
			array_set($files, $group, $this->getGroup($group));
		}

		return $files;
	}

	/**
	 * Return all files to be digged
	 * @return array
	 */
	public function getDiggFiles()
	{
		$files   = array();

		foreach ($this->getDiggFolders() as $folder) {

			try {
				$results = App::make('Finder')->files()->name('*.php')->in(base_path($folder));

				foreach($results as $result)
					array_push($files, $result->getRealPath());

			} catch(InvalidArgumentException $e) {
				// Folder not found, ignoring...
			}
		}

		return $files;
	}

	/**
	 * Get group
	 * @param  string $name
	 * @return array
	 */
	protected function getGroup($name)
	{
		$name = ($this->namespace) ? $this->namespace . '::' . $name : $name;
		return (Lang::has($name)) ? Lang::get($name) : array();
	}

	/**
	 * Load languages in custom array.
	 *
	 * If you know how to override the loaded array inside the Translator class let me know!
	 * @param  string $group
	 * @return array
	 */
	protected function loadGroup($group)
	{
		if($loaded = array_get($this->loaded, $this->language . "." . $group)) return $loaded;
		$lines = $this->getGroup($group);
		array_set($this->loaded, $this->language . "." . $group, $lines);

		return $lines;
	}

	/**
	 * Write translations to file
	 * @param  string $group
	 * @param  array $lines
	 * @return boolean
	 */
	protected function writeToFile($group, $lines)
	{
		// Store this so we get updated values
		array_set($this->loaded, $this->language . "." . $group, $lines);

		// Add slashes to array values
		array_walk_recursive($lines, function (&$item) {
			$item = addslashes($item);
		});

		$date    = Carbon::now()->format('d-m-Y H:i');
		$string = "<?php\n\n# modified at $date\n\nreturn ".$this->prettyPrintArray($lines)."\n";

		return File::put($this->getFilePath($group), $string );
	}

	/**
	 * Write array to pretty string format
	 * @param  array $lines
	 * @return string
	 */
	protected function prettyPrintArray($lines, $recursionLevel = 1, $minLongest = 0)
	{
		// Pretty Print String
		$string = "\n";

		// Determine longest array key
		$longest = $this->longestLine(array_keys($lines));

		// If our parent is longer than current, use parent as minimum
		if($longest < $minLongest)
			$longest = $minLongest;

		// Spacing after language key
		$spacing = str_repeat(' ', 1);

		$indent = str_repeat("\t", $recursionLevel);
		$post_indent = str_repeat("\t", ($recursionLevel-1));

		// Sort by key, to make even more pretty!
		ksort($lines);
		foreach($lines as $line => $translation)
		{
			if(is_array($translation))
			{
				$value = $this->prettyPrintArray($translation, ($recursionLevel+1), $longest);
			}
			else
			{
				$value = "'$translation'";
			}

			$spaces = (($diff = $longest - strlen($line)) > 0) ? str_repeat(" ", $diff) : '';
			$string .= $indent."'{$line}'{$spaces}{$spacing}=>{$spacing}{$value},\n";
		}

		return " array({$string}{$post_indent})".($recursionLevel==1 ? ';' : '');
	}

	/**
	 * Return the longest translation
	 * @param  array $lines
	 * @return integer
	 */
	protected function longestLine($lines)
	{
		if(empty($lines)) return 0;
		return max(array_map('strlen', $lines)) + 2;
	}

	/**
	 * Return path to language group
	 * @param  string $group
	 * @return string
	 */
	protected function getFilePath($group)
	{
		return $this->getLangPath($this->language . DIRECTORY_SEPARATOR . $group . '.php');
	}

	/**
	 * Get path to current language
	 * @return string
	 */
	protected function getLanguagePath()
	{
		return $this->getLangPath($this->language);
	}

	/**
	 * Get files that need to be ignored when running the clean command
	 * @return array
	 */
	protected function getIgnoredFiles()
	{
		return Config::get('translate::search_exclude_files');
	}

	/**
	 * Get folders that need to be ignored when running the clean command
	 * @return array
	 */
	protected function getIgnoredFolders()
	{
		return Config::get('translate::search_ignore_folders');
	}

	/**
	 * Get folders that need to be ignored when running the digg command
	 * @return array
	 */
	protected function getDiggFolders()
	{
		return Config::get('translate::digg_folders');
	}

}
