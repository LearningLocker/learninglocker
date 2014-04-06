<?php

use Locker\Repository\Statement\StatementRepository as Statement;
use Locker\Repository\Lrs\LrsRepository as Lrs;

class StatementController extends BaseController {

  /**
  * Statement
  */
  protected $statement;

  /**
  * Lrs 
  */
  protected $lrs;

  /**
   * Construct
   *
   * @param StatementRepository $statement
   */
  public function __construct( Statement $statement, Lrs $lrs ){

    $this->statement = $statement;
    $this->lrs       = $lrs;

    $this->beforeFilter('auth');
    $this->beforeFilter('csrf', array('only' => 'store'));
    $this->beforeFilter('@checkCanSubmit', array('only' => 'store'));

  }

  /**
   * Show the form for creating a new resource.
   *
   * @return View
   */
  public function create( $id ){
    $lrs = $this->lrs->find( $id );
    return View::make('partials.statements.create', array('lrs'           => $lrs,
                                                          'statement_nav' => true));
  }

  /**
   * Store a newly created resource in storage.
   *
   * This is ony used via the manual statement generator on the 
   * site. Look in /api/statements for incoming statements.
   *
   * @return Response
   */
  public function store(){

    $input = Input::all();

    $lrs = $this->lrs->find( $input['lrs'] );

    //remove lrs and _token from Input
    unset( $input['lrs'] );
    unset( $input['_token'] );

    //add mailto to actor mbox
    $input['actor']['mbox'] = 'mailto:' . $input['actor']['mbox'];

    // Save the statement
    $s = $this->statement->create( array($input), $lrs );

    if($s){
      return Redirect::back()->with('success', Lang::get('statement.added'));
    }

    return Redirect::back()
        ->withInput()
        ->withErrors($s->errors());

  }

  /**
   * Can current user submit statements to this LRS?
   **/
  public function checkCanSubmit( $route, $request ){

    $user      = \Auth::user();
    $lrs       = $this->lrs->find( Input::get('lrs') );
    $get_users = array();

    if( $lrs ){
      foreach( $lrs->users as $u ){
        $get_users[] = $u['_id'];
      }
    }

    //check current user is in the list of allowed users, or is super admin
    if( !in_array($user->_id, $get_users) && $user->role != 'super' ){
      return Redirect::to('/');
    }

  }

}