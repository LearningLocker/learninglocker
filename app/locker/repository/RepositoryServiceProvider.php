<?php namespace Locker\Repository;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider {

  public function register(){

    $this->app->bind(
      'Locker\Repository\User\UserRepository',
      'Locker\Repository\User\EloquentUserRepository'
    );
    $this->app->bind(
      'Locker\Repository\Statement\StatementRepository',
      'Locker\Repository\Statement\EloquentStatementRepository'
    );
    $this->app->bind(
      'Locker\Repository\Lrs\LrsRepository',
      'Locker\Repository\Lrs\EloquentLrsRepository'
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
      'Locker\Repository\Activity\ActivityRepository',
      'Locker\Repository\Activity\EloquentActivityRepository'
    );
    $this->app->bind(
      'Locker\Repository\OAuthApp\OAuthAppRepository',
      'Locker\Repository\OAuthApp\EloquentOAuthAppRepository'
    );
  }


}