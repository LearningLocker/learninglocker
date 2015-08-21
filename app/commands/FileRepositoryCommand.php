<?php
use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;
use Locker\Repository\File\Factory as FileFactory;

class FileRepositoryCommand extends Command {
	protected $name = 'll:file-repo';
	protected $description = 'Migrates files from one file repository (i.e. Local) to another (i.e. Rackspace).';

	public function fire() {
    $from_var = $this->option('from');
    $to_var = $this->argument('to');
		$from_repo = FileFactory::createRepo($from_var);
    $to_repo = FileFactory::createRepo($to_var);
    $files = $from_repo->index([]);

    $count = 0;
    foreach ($files as $file) {
      $path = $file['path'];
      if ($file['type'] === 'file' && !$to_repo->has($path, [])) {
        $count += 1;
        $to_repo->update($path, ['content' => $from_repo->show($path, [])], []);
        echo "Migrated '{$path}' from '{$from_var}' to '{$to_var}'.".PHP_EOL;
      } 
    }

    echo "Migrated $count files and ignored ".(count($files) - $count).".".PHP_EOL;
	}

	protected function getArguments() {
		return [
      ['to', InputArgument::REQUIRED, 'The repository to migrate to.']
    ];
	}

	protected function getOptions() {
		return [
			['from', 'f', InputOption::VALUE_OPTIONAL, 'The repository to migrate from.', 'Local'],
		];
	}

}
