<?php

use Locker\Repository\OAuthApp\OAuthAppRepository as OAuthApp;

class OAuthAppController extends BaseController {

  /**
  * App
  */
  protected $app;


  /**
   * Construct
   *
   * @param App $app
   */
  public function __construct(OAuthApp $app){

    $this->app = $app;

    $this->beforeFilter('auth');
    $this->beforeFilter('csrf', array('only' => 'store', 'update'));
  
  }

  /**
   * Display a listing of LRSs available for user.
   *
   * @return View
   */
  public function index(){
    $apps = $this->app->all();
    return View::make('partials.oauth.index', array('apps' => $apps));
  }

  /**
   * Show the form for creating a new resource.
   *
   * @return View
   */
  public function create(){
    return View::make('partials.oauth.create');
  }

  /**
   * Store a newly created resource in storage.
   *
   * @return View
   */
  public function store(){
    // Store app
    $s = $this->app->create( Input::all() );

    if($s){
      return Redirect::to('/oauth/apps')->with('success', Lang::get('apps.create'));
    }

    return Redirect::back()
      ->withInput()
      ->with('error', Lang::get('apps.create.problem'));
  }

  /**
   * Show the form for editing the specified resource.
   *
   * @param  int  $id
   * @return View
   */
  public function edit( $id ){

  }

  /**
   * Update the specified resource in storage.
   *
   * @param  int  $id
   * @return View
   */
  public function update($id){
    $l = $this->app->update( $id, Input::all() );

    if($l){
      return Redirect::back()->with('success', Lang::get('app.updated'));
    }

    return Redirect::back()
          ->withInput()
          ->withErrors($this->lrs->errors());
  }

  /**
   * Display the specified resource.
   *
   * @param  int  $id
   * @return View
   */
  public function show( $id ){

    $app = $this->app->find( $id );
    return View::make('partials.oauth.show', array('app'      => $app, 
                                           'app_nav' => true));
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param  int  $id
   * @return View
   */
  public function destroy($id){

    $this->app->delete($id);
    return $this->index();

  }

}