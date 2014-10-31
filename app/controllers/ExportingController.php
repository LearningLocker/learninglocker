<?php

use Locker\Repository\Lrs\LrsRepository as Lrs;

class ExportingController extends \BaseController {

  protected $views = 'partials.exports';
  protected $lrs;

  public function __construct(Lrs $lrs){
    $this->lrs = $lrs;
    
    $this->beforeFilter('auth');
    $this->beforeFilter('auth.lrs'); //check user can access LRS.
    $this->beforeFilter('csrf', array('only' => array('update', 'store', 'destroy')));
  }

  /**
   * Display a listing of the resource.
   *
   * @return Response
   */
  public function index($id){
    $lrs      = $this->lrs->find( $id );
    $lrs_list = $this->lrs->all();
    return View::make("{$this->views}.index", [
      'lrs' => $lrs, 
      'list' => $lrs_list,
      'exporting_nav' => true
    ]);
  }
}