<?php namespace Locker\Repository\Statement;

use Statement;

class EloquentStatementRepository implements StatementRepository {

	/**
	 * Return a list of statements ordered by stored desc
	 *
	 * Don't return voided statements, these are requested 
	 * in a different call.
	 *
	 **/
	public function all( $id, $parameters ){ 

		$statements = \Statement::where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $id);
		$statements->where( 'verb.id', '<>', 'http://adlnet.gov/expapi/verbs/voided');
		
		if( $parameters['verb'] != '' ){
			$statements->where( 'verb.id', $parameters['verb'] );
		}

		if( $parameters['activity'] != '' ){
			$statements->where( 'object.id', $parameters['activity']);
		}

		if( $parameters['limit'] != '' ){
			$statements->take( $parameters['limit'] );
		}else{
			$statements->take(2);
		}
			   
		if( $parameters['offset'] != 0 ){
			$statements->skip( $parameters['offset'] );
		}

		if( $parameters['ascending'] ){
			$statements->orderBy('stored', 'asc');
		}else{
			$statements->orderBy('stored', 'desc');
		}

		return $statements->get();

	}

	/**
	 * Find a statement based on statementID
	 * 
	 * @return response
	 **/
	public function find( $id ){ 
		return \Statement::where('id', $id)->first();
	}

	/*
	|-----------------------------------------------------------------------
	| Store incoming xAPI statements
	|
	| As Learning Locker lets you run several LRSs within the one install
	| we add a context extension to determine which LRS the statement has been
	| submitted against.
	| 
	| We also store a category for the statement as a context extension.
	|
	| Steps: 
	| 1. Grab incoming statement and convert to associative array
	| 2. Verify the statement
	| 3. Add LRS details
	| 4. Add category
	| 5. Add stored 
	| 6. Save statement
	| 7. Return suitable message to application submitting
	| 
	| Notes: 
	| Mongo doesn't allow full stops (.) in keys as it is reserved, so, 
	| we replace with &46; where required.
	|
	| For now we use the site's details as the authority. 
	| @todo perhaps there needs to be a way to set authority details per LRS?
	|
	| @param $input Array The TinCan statement
	| @param $lrs Array The LRS for this statement
	|
	|------------------------------------------------------------------------
	 */
	public function create( $statement, $lrs ){

		/*
		|------------------------------------------------------------------------------
		| Full tincan statement validation to make sure the statement conforms
		|------------------------------------------------------------------------------
		*/
		$verify = new \app\locker\statements\xAPIValidation( $statement, \Site::first() );

		//run full validation
		$return = $verify->runValidation();

		//if the statement does not validate, return with errors
		if( $return['status'] == 'failed' ){
			return array( 'success' => false, 
						  'message' => $return['errors']);
		}

		//statement has validated, so continue with verified statement. 
		$vs = $return['statement'];


		/*
		|------------------------------------------------------------------------------
		| Add the correct learning locker LRS. 
		|------------------------------------------------------------------------------
		*/
		$vs['context']['extensions']['http://learninglocker&46;net/extensions/lrs'] = array( '_id'  => $lrs->_id, 
																							 'name' => $lrs->title );


		/*
		|------------------------------------------------------------------------------
		| The date stored in LRS in ISO 8601 format
		|------------------------------------------------------------------------------
		*/
		$vs['stored'] = date('c');

	   
		/*
		|------------------------------------------------------------------------------
		| Check to see if the object is an activity, if so, check to see if that 
		| activity is already in the DB. if it is, use the stored version. 
		| If not, store it.
		|------------------------------------------------------------------------------
		*/
		$vs['object']['definition'] = $this->saveActivity( $vs['object']['id'], $vs['object']['definition'] );


		/*
		|------------------------------------------------------------------------------
		| Run through keys to make sure there are no full stops. If so, replace with
		| html entity &46; - this will probably only occur in extensions.
		|------------------------------------------------------------------------------
		*/
		$vs = $this->replaceFullStop( $vs );
		

		/*
		|-------------------------------------------------------------------------------
		| Create a new statement object
		|-------------------------------------------------------------------------------
		*/
		$new_statement = new Statement;
		$new_statement->fill( $vs );

		if( $new_statement->save() ){
			return array( 'success' => true, 
						  'id'      => $new_statement->_id );
		}

		return array( 'success' => false, 
					  'message' => $new_statement->errors );

	}


	/*
	|-------------------------------------------------------------------------------
	| Save object type activity for reference. 
	|-------------------------------------------------------------------------------
	*/
	private function saveActivity( $activity_id, $activity_def ){

		$exists = \DB::table('activities')->find( $activity_id );

		//if the object activity exists, return details on record.
		if( $exists ){
			return $exists['definition'];
		}else{
			//save it
			\DB::table('activities')->insert(
				array('_id' 	   => $activity_id, 
					  'definition' => $activity_def)
			);
			return $activity_def;
		}

	}


	/*
	|-------------------------------------------------------------------------------
	| Mongo doesn't allow full stops (.) in keys as it is reserved, so, 
	| we replace with &46; where required. This will most likely only
	| happen in extensions.
	|-------------------------------------------------------------------------------
	*/
	private function replaceFullStop( $statement ){

		$statement = \app\locker\helpers\Helpers::replaceFullStop( $statement );
		return $statement;
		
	}

	/*
	|-----------------------------------------------------------------------
	| Return statement with no filter
	|------------------------------------------------------------------------
	*/
	public function statements( $id ){

		return \Statement::where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $id)
		->orderBy('created_at', 'desc')
		->paginate(15);

	}

	/*
	|----------------------------------------------------------------------
	| Filter statements via our filtering options. 
	|
	| @param $id The LRS unique id.
	| @param $vars array An array or parameters grabbed from the url. 
	|
	| @return array - an array containing statements for display and data 
	| for the graph.
	|----------------------------------------------------------------------
	*/
	public function filter( $id, $vars='', $restrict='' ){

		$filter = array();
		$data   = '';

		//create key / value array for wheres from $vars sent over
		if( isset($vars) && !empty($vars) ){
			while (count($vars)) {
	    		list($key,$value) = array_splice($vars, 0, 2);
	    		$filter[$key] = $value;
			}
		}

		$query = \Statement::where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $id);
		$this->setRestriction( $restrict, $query );
		if( !empty($filter) ){
			$this->setWhere( $filter, $query );
		}
		$query->orderBy('created_at', 'desc');
		//$query->remember(5);
		$statements = $query->paginate(18);

		//@todo replace this using Mongo aggregation - no need to grab everything and loop through it.
		$query = \Statement::where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $id);
		$this->setRestriction( $restrict, $query );
		if( !empty($filter) ){
			$this->setWhere( $filter, $query );
		}
		$query->remember(5);
		$data = $query->get();

		return array( 'statements' => $statements, 
					  'data'       => $data, 
					  'filter' 	   => $filter );

	}

	/*
	|----------------------------------------------------------------------
	|
	| Loop through passed parameters and add to DB query.
	|
	| @todo only decode on urls not everything
	|
	|----------------------------------------------------------------------
	*/
	private function setWhere( $filter, $query ){

		foreach( $filter as $k => $v ){
			$k = $this->filterKeyLookUp( $k );
			$query->where( $k, rawurldecode( $v ) );
		}
		return $query;

	}

	/*
	|----------------------------------------------------------------------
	|
	| Set a restriction for the query if one was passed
	|
	|----------------------------------------------------------------------
	*/
	private function setRestriction( $restriction, $query ){

		if( $restriction != '' ){
			switch( $restriction ){
				case 'comments':
					return $query->where( 'object.definition.type', 'http://activitystrea.ms/schema/1.0/comment' );
				case 'badges':
					return $query->where( 'object.definition.type', 'http://activitystrea.ms/schema/1.0/badge' );
				case 'results':
					return $query->where( '', '' );
				case 'courses':
					return $query->where( 'object.definition.type', 'http://activitystrea.ms/schema/1.0/course' );
				default:
					return $query->where( 'object.definition.type', 'http://activitystrea.ms/schema/1.0/comment' );
			}
		}

	}

	private function filterKeyLookUp( $key ){
		switch( $key ){
			case 'actor':
				return 'actor.mbox';
			case 'verb':
				return 'verb.display.en-US';
			case 'parent':
				return 'context.contextActivities.parent.id';
			case 'course':
				return 'context.contextActivities.grouping.id';
			case 'activity':
				return 'object.id';
		}
	}

}