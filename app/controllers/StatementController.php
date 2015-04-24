<?php

use Locker\Repository\Statement\Repository as StatementRepo;
use Locker\Repository\Lrs\Repository as LrsRepo;

class StatementController extends BaseController {

  protected $statement, $lrs;

  /**
   * Construct
   */
  public function __construct(StatementRepo $statement, LrsRepo $lrs) {
    $this->statement = $statement;
    $this->lrs = $lrs;

    $this->beforeFilter('auth');
    $this->beforeFilter('csrf', array('only' => 'store'));
    $this->beforeFilter('@checkCanSubmit', array('only' => 'store'));
  }

  /**
   * Show the form for creating a new resource.
   * @return View
   */
  public function create($lrs_id) {
    $opts = ['user' => \Auth::user()];
    $lrs = $this->lrs->show($lrs_id, $opts);
    return \View::make('partials.statements.create', [
      'lrs' => $lrs,
      'statement_nav' => true
    ]);
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
    $input = \Input::all();

    $opts = ['user' => \Auth::user()];
    $lrs = $this->lrs->show($input['lrs'], $opts);

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
    $user = \Auth::user();
    $opts = ['user' => $user];
    $lrs = $this->lrs->show(Input::get('lrs'), $opts);
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