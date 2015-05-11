<?php

use Locker\Repository\Lrs\Repository as LrsRepo;

class ExportingController extends \BaseController {

  protected $views = 'partials.exports';
  protected $lrs;

  public function __construct(LrsRepo $lrs){
    $this->lrs = $lrs;
    $this->beforeFilter('auth');
    $this->beforeFilter('auth.lrs'); //check user can access LRS.
    $this->beforeFilter('csrf', array('only' => array('update', 'store', 'destroy')));
  }

  /**./ve
   * Display a listing of the resource.
   * @return View
   */
  public function index($lrs_id){
    $opts = ['user' => \Auth::user()];
    $lrs = $this->lrs->show($lrs_id, $opts);
    $lrs_list = $this->lrs->index($opts);
    return View::make("{$this->views}.index", [
      'lrs' => $lrs, 
      'list' => $lrs_list,
      'exporting_nav' => true,
      'client' => (new \Client)->where('lrs_id', $lrs_id)->first()
    ]);
  }
}