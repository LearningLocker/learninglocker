<?php

use Locker\Repository\Lrs\LrsRepository as Lrs;

class ExportingController extends \BaseController {

  protected $lrs;
  protected $export;
  protected $params;

  public function __construct(Lrs $lrs){
    $this->lrs = $lrs;
    
    $this->beforeFilter('auth');
    $this->beforeFilter('auth.lrs'); //check user can access LRS.
    $this->beforeFilter('csrf', array('only' => array('update', 'store', 'destroy')));
    $this->beforeFilter('@setParameters');
  }

  /**
   * Display a listing of the resource.
   *
   * @return Response
   */
  public function index($id){
    $lrs      = $this->lrs->find( $id );
    $lrs_list = $this->lrs->all();
    return View::make('partials.exports.index', [
      'lrs' => $lrs, 
      'list' => $lrs_list,
      'exporting_nav' => true
    ]);
  }

  /**
   * Get all of the input and files for the request and store them in params.
   *
   */
  public function setParameters(){
    $this->params = \LockerRequest::all();
  }

}