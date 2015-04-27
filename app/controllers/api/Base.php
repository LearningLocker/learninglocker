<?php namespace Controllers\API;

use \Illuminate\Routing\Controller;
use \Response as IlluminateResponse;
use \LockerRequest as LockerRequest;
use \Config as Config;
use \Request as Request;
use \Route as Route;
use \DB as DB;
use \Locker\Repository\Lrs\EloquentRepository as LrsRepository;
use \Lrs as Lrs;
use \Client as Client;
use \Locker\Helpers\Helpers as Helpers;
use \LucaDegasperi\OAuth2Server\Filters\OAuthFilter as OAuthFilter;

class Base extends Controller {

  /**
   * Constructs a new base controller.
   */
  public function __construct() {
    \Log::info('here');
    $this->filterScopes(['all']);
    \Log::info('Woo');
    $this->lrs = Helpers::getLrsFromAuth();
  }

  /**
   * Gets the options from the request.
   * @return [String => Mixed]
   */
  protected function getOptions() {
    return [
      'lrs_id' => $this->lrs->_id
    ];
  }

  protected function returnJson($data) {
    $params = LockerRequest::getParams();
    if (LockerRequest::hasParam('filter')) {
      $params['filter'] = json_decode(LockerRequest::getParam('filter'));
    }

    return IlluminateResponse::json([
      'version' => Config::get('api.using_version'),
      'route' => Request::path(),
      'url_params' => Route::getCurrentRoute()->parameters(),
      'params' => $params,
      'data' => $data,
      'debug' => !Config::get('app.debug') ? trans('api.info.trace') : DB::getQueryLog()
    ]);
  }

  protected function filterScopes($scopes) {
    // Registers the OAuth filter with LockerRequest headers.
    $app->bindShared('LucaDegasperi\OAuth2Server\Filters\OAuthFilter', function ($container) {
      $httpHeadersOnly = $container['config']->get('oauth2-server-laravel::oauth2.http_headers_only');
      return new OAuthFilter($container['oauth2-server.authorizer'], $httpHeadersOnly);
    });

    // Calls the filter.
    $filter = 'oauth';
    $request = \Request::instance();
    $route = $this->filterer->findRoute($request);
    $response = null;
    return $this->filterer->callRouteFilter($filter, $scopes, $route, $request, $response);
  }
}
