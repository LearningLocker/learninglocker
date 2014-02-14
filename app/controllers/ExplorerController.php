<?php

use Locker\Repository\Statement\StatementRepository as Statement;
use Locker\Repository\Lrs\LrsRepository as Lrs;

class ExplorerController extends BaseController {

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
   * @param Statement $statement
   */
  public function __construct( Statement $statement, Lrs $lrs ){

    $this->statement = $statement;
    $this->lrs       = $lrs;

    $this->beforeFilter('auth');

  }

  public function explore( $id ){

    $vars = explode( '/', Request::path() );

    //remove lrs and statement which is always passed
    unset( $vars[0] ); //remove lrs
    unset( $vars[1] ); //remove lrs id
    unset( $vars[2] ); //remove statements
    unset( $vars[3] ); //remove explorer

    $lrs      = $this->lrs->find( $id );
    $lrs_list = $this->lrs->all();
    $statements = $this->statement->filter( $id, $vars, 'comments' );
    $graph_it   = new \app\locker\data\Filter( $statements['data'] );
    return View::make('partials.statements.explore', array('lrs'             => $lrs,
                                                           'list'            => $lrs_list,
                                                           'statements'      => $statements['statements'],
                                                           'total'           => count( $statements['data'] ),
                                                           'filter'          => $statements['filter'],
                                                           'results'         => $graph_it->results,
                                                           'single_bar_data' => $graph_it->timeline_data,
                                                           'statement_nav'   => true));
  }

  /**
   * Display the specified resource.
   *
   * @todo figure out how to use \Route::getCurrentRoute()->parameters() 
   * instead of the hack below. The problem is exploding extra - it
   * also explodes any urls passed.
   * 
   * @param  int  $id
   * @return Response
   */
  public function filter( $id, $extra ){

    $vars = explode( '/', Request::path() );

    //remove lrs and statement which is always passed
    unset( $vars[0] );
    unset( $vars[1] );
    unset( $vars[2] );

    $statements = $this->statement->filter( $id, $vars );
    $graph_it   = new \app\locker\data\Filter( $statements['data'] );
    $lrs        = $this->lrs->find( $id );
    $lrs_list   = $this->lrs->all();

    return View::make('partials.statements.filter', 
                  array('statements'      => $statements['statements'],
                        'lrs'             => $lrs,
                        'single_bar_data' => $graph_it->timeline_data,
                        'results'         => $graph_it->results,
                        'total'           => count( $statements['data'] ),
                        'list'            => $lrs_list,
                        'filter'          => $statements['filter'],
                        'statement_nav'   => true));

  }

}