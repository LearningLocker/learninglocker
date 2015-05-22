<?php namespace Philo\Translate;

use Illuminate\Support\ServiceProvider;

class TranslateServiceProvider extends ServiceProvider {

	/**
	 * Indicates if loading of the provider is deferred.
	 *
	 * @var bool
	 */
	protected $defer = false;

	/**
	 * Bootstrap the application events.
	 *
	 * @return void
	 */
	public function boot()
	{
		$this->package('philo/translate');

		$this->app->bind('Finder', function($app)
		{
			return new \Symfony\Component\Finder\Finder();
		});
	}

	/**
	 * Register the service provider.
	 *
	 * @return void
	 */
	public function register()
	{
		$this->registerAddCommand();
		$this->registerRemoveCommand();
		$this->registerCleanUpCommand();
		$this->registerDiggCommand();
	}

	/**
	 * Register the add console command.
	 *
	 * @return void
	 */
	protected function registerAddCommand()
	{
		$this->app->bind('command.translate.add', function($app)
		{
			return $app->make('Philo\Translate\Console\AddCommand');
		});

		$this->commands('command.translate.add');
	}

	/**
	 * Register the remove console command.
	 *
	 * @return void
	 */
	protected function registerRemoveCommand()
	{
		$this->app->bind('command.translate.remove', function($app)
		{
			return $app->make('Philo\Translate\Console\RemoveCommand');
		});

		$this->commands('command.translate.remove');
	}

	/**
	 * Register the clean up console command.
	 *
	 * @return void
	 */
	protected function registerCleanUpCommand()
	{
		$this->app->bind('command.translate.cleanup', function($app)
		{
			return $app->make('Philo\Translate\Console\CleanUpCommand');
		});

		$this->commands('command.translate.cleanup');
	}

	/**
	 * Register the digg console command.
	 *
	 * @return void
	 */
	protected function registerDiggCommand()
	{
		$this->app->bind('command.translate.digg', function($app)
		{
			return $app->make('Philo\Translate\Console\DiggCommand');
		});

		$this->commands('command.translate.digg');
	}

	/**
	 * Get the services provided by the provider.
	 *
	 * @return array
	 */
	public function provides()
	{
		return array();
	}

}
