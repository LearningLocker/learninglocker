<?php namespace locker;

use Illuminate\Support\Facades\Facade;

class RequestFacade extends Facade {
  protected static function getFacadeAccessor() {
    return 'locker_request';
  }
}