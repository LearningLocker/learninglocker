<?php namespace Locker\Repository\OAuthApp;

interface OAuthAppRepository {

  public function create( $input );

  public function all();

  public function delete($id);

  public function find($id);

}