<?php namespace Locker\Repository;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider {

  public function register(){

    $this->app->bind(
      'Locker\Repository\User\UserRepository',
      'Locker\Repository\User\EloquentUserRepository'
    );
    $this->app->bind(
      'Locker\Repository\Statement\Repository',
      'Locker\Repository\Statement\EloquentRepository'
    );
    $this->app->bind(
      'Locker\Repository\Lrs\Repository',
      'Locker\Repository\Lrs\EloquentRepository'
    );
	$this->app->bind(
      'Locker\Repository\Client\Repository',
      'Locker\Repository\Client\EloquentRepository'
    );
    $this->app->bind(
      'Locker\Repository\Site\SiteRepository',
      'Locker\Repository\Site\EloquentSiteRepository'
    );
    $this->app->bind(
      'Locker\Repository\Query\QueryRepository',
      'Locker\Repository\Query\EloquentQueryRepository'
    );
    $this->app->bind(
      'Locker\Repository\Document\DocumentRepository',
      'Locker\Repository\Document\EloquentDocumentRepository'
    );
    $this->app->bind(
      'Locker\Repository\OAuthApp\OAuthAppRepository',
      'Locker\Repository\OAuthApp\EloquentOAuthAppRepository'
    );
    $this->app->bind(
      'Locker\Repository\Report\Repository',
      'Locker\Repository\Report\EloquentRepository'
    );
    $this->app->bind(
      'Locker\Repository\Export\Repository',
      'Locker\Repository\Export\EloquentRepository'
    );
  }


}