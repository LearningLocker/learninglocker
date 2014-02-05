<?php

use Locker\Repository\Statement\StatementRepository as Statement;

class StatementController extends BaseController {

	/**
	* Statement
	*/
	protected $statement;


	/**
	 * Construct
	 *
	 * @param Statement $statement
	 */
	public function __construct(Statement $statement){

		$this->statement = $statement;

		$this->beforeFilter('auth', array('except'));
		$this->beforeFilter('csrf', array('on' => 'post'));
		$this->beforeFilter('@checkCanSubmit', array('only' => 'store'));

	}

	/**
	 * Display a listing of statements for a user.
	 *
	 * @return Response
	 */
	public function index(){}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return View
	 */
	public function create( $id ){
		$lrs = Lrs::find( $id );
		return View::make('partials.statements.create', array('lrs'           => $lrs,
															  'statement_nav' => true));
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store(){

		$input = Input::all();

		//get lrs
		$lrs = Lrs::where( '_id', $input['lrs'] )
			   ->select('_id', 'title')
			   ->first();

		//remove lrs and _token from Input
		unset( $input['lrs'] );
		unset( $input['_token'] );

		//add mailto to actor mbox
		$input['actor']['mbox'] = 'mailto:' . $input['actor']['mbox'];

		// Save the statement
		$s = $this->statement->create( $input, $lrs );

		if($s){
			return Redirect::back()->with('success', Lang::get('statement.added'));
		}

		return Redirect::back()
				->withInput()
				->withErrors($s->errors());

	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show( $id ){}

	public function explore( $id ){

		$vars = explode( '/', Request::path() );

		//remove lrs and statement which is always passed
		unset( $vars[0] ); //remove lrs
		unset( $vars[1] ); //remove lrs id
		unset( $vars[2] ); //remove statements
		unset( $vars[3] ); //remove explorer

		$lrs      = Lrs::find( $id );
		$lrs_list = \Lrs::all();
		$statements = $this->statement->filter( $id, $vars, 'comments' );
		$graph_it   = new \app\locker\data\Filter( $statements['data'] );

		return View::make('partials.statements.explore', array('lrs'           => $lrs,
															   'list'          => $lrs_list,
															   'statements'    => $statements['statements'],
															   'total'		   => count( $statements['data'] ),
															   'filter'		   => $statements['filter'],
															   'single_bar_data' => $graph_it->timeline_data,
															   'statement_nav' => true));
	}

	/**
	 * Display the specified resource.
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
		$lrs        = \Lrs::find( $id );
		$lrs_list   = \Lrs::all();

		return View::make('partials.statements.filter', 
									array('statements'      => $statements['statements'],
										  'lrs'             => $lrs,
										  'single_bar_data' => $graph_it->timeline_data,
										  'total'		    => count( $statements['data'] ),
										  'list'            => $lrs_list,
										  'filter'		    => $statements['filter'],
										  'statement_nav'   => true));

	}

	/**
	 * Can current user submit statements to this LRS?
	 **/
	public function checkCanSubmit( $route, $request ){

		$user      = \Auth::user();
		$lrs       = Lrs::find( Input::get('lrs') );
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