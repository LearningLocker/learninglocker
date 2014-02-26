<?php namespace Locker\Repository\Statement;

use Statement;
use Locker\Repository\Activity\ActivityRepository as Activity;
use Locker\Repository\Query\QueryRepository as Query;

class EloquentStatementRepository implements StatementRepository {

  /**
  * Statement
  */
  protected $statement, $activity, $query;

  /**
   * Construct
   *
   * @param Statement $statement
   * @param Activity  $activity
   *
   */
  public function __construct( Statement $statement, Activity $activity, Query $query ){

    $this->statement = $statement;
    $this->activity  = $activity;
    $this->query = $query;

  }

  /**
   * Return a list of statements ordered by stored desc
   *
   * Don't return voided statements, these are requested 
   * in a different call.
   *
   * @param $id int The LRS in question.
   * @param $parameters array Any parameters for filtering
   *
   * @return statement objects
   *
   **/
  public function all( $id, $parameters ){ 

    $statements = $this->statement->where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $id);

    $this->addParameters( $statements, $parameters );

    return $statements->get();

  }

  public function grouped($id, $parameters){

    $type = isset($parameters['grouping']) ? strtolower($parameters['grouping']) : '';
    
    switch( $type ){
      default:
      case "time":
        $interval = isset($parameters['interval']) ? $parameters['interval'] : "day";
        $filters = isset($parameters['filters']) ? json_decode($parameters['filters'], true) : array();

        //overwrite the LRS filter
        $filters['context.extensions.http://learninglocker&46;net/extensions/lrs._id'] = $id;

        $results = $this->query->timedGrouping( $filters, $interval );
      break;
      case "actor":

      break;
      case "activity":

      break;
      case "verb":

      break;
    }

    return $results;

  }

  /**
   * Find a statement based on statementID
   * 
   * @param string $id A statement id (uuid)
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
  
  /**
   * @param array $statements An array of statements to create
   * @param array $lrs
   *
   **/
  public function create( $statements, $lrs ){

    //Full tincan statement validation to make sure the statement conforms
    
    $saved_ids = array();
    foreach( $statements as &$statement ){ //loop and amend - return on fail

      $verify = new \app\locker\statements\xAPIValidation( $statement, \Site::first() );

      //run full validation
      $return = $verify->runValidation();

      if( $return['status'] == 'failed' ){
        return array( 'success' => 'false',  'message' => $return['errors'] );
      } else {
        $statement = $return['statement'];
      }
    }

    //now we are sure that statements are valid - loop back through and actually add them
    foreach( $statements as $vs ){

      //check to see if the statementId already has a statement in the LRS
      if( $result = $this->doesStatementIdExist( $lrs->_id, $vs['id'], $statement ) ){
        return array( 'success' => $result ); 
      }

      //Add the correct learning locker LRS. 
      $vs['context']['extensions']['http://learninglocker&46;net/extensions/lrs'] = array( '_id'  => $lrs->_id, 
                                                                                           'name' => $lrs->title );


      //The date stored in LRS in ISO 8601 format
      $vs['stored'] = date('c');

       
      /*
      |------------------------------------------------------------------------------
      | Check to see if the object is an activity, if so, check to see if that 
      | activity is already in the DB. if it is, use the stored version. 
      | If not, store it.
      |------------------------------------------------------------------------------
      */
      if( isset($vs['object']['definition'])){
        $vs['object']['definition'] = $this->activity->saveActivity( $vs['object']['id'], $vs['object']['definition'] );
      }


      /*
      |------------------------------------------------------------------------------
      | Run through keys to make sure there are no full stops. If so, replace with
      | html entity &46; - this will probably only occur in extensions.
      |------------------------------------------------------------------------------
      */
      $vs = $this->replaceFullStop( $vs );
      

      //Create a new statement object
      $new_statement = new Statement;
      $new_statement->fill( $vs );

      if( $new_statement->save() ){
        $saved_ids[] = $new_statement->id;
      } else {
        return array( 'success' => 'false', 
                    'message' => $new_statement->errors );
      }

      
    }

    return array('success'=>true, 'ids'=>$saved_ids );

  }


  /**
   *
   * Mongo doesn't allow full stops (.) in keys as it is reserved, so, 
   * we replace with &46; where required. This will most likely only
   * happen in extensions.
   *
   * @param array $statement A full statement array
   *
   * @return array $statement
   *
   */
  private function replaceFullStop( $statement ){

    $statement = \app\locker\helpers\Helpers::replaceFullStop( $statement );
    return $statement;
    
  }

  /**
   * 
   * Return statements with no filter for a particular LRS
   *
   * @param int $id The LRS _id.
   *
   * @return array of statements.
   * 
   */
  public function statements( $id ){

    return $this->statement->where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $id)
    ->orderBy('created_at', 'desc')
    ->paginate(15);

  }

  /**
   *
   * Filter statements via our filtering options. 
   *
   * @param int   $id        The LRS unique id.
   * @param array $vars      An array or parameters grabbed from the url
   * @param string $restrict Value to restrict query 
   *
   * @return array An array containing statements for display and data 
   * for the graph.
   *
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

    $query = $this->statement->where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $id);
    $this->setRestriction( $restrict, $query );
    if( !empty($filter) ){
      $this->setWhere( $filter, $query );
    }
    $query->orderBy('created_at', 'desc');
    $statements = $query->paginate(18);

    //@todo replace this using Mongo aggregation - no need to grab everything and loop through it.
    $query = $this->statement->where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $id);
    $this->setRestriction( $restrict, $query );
    if( !empty($filter) ){
      $this->setWhere( $filter, $query );
    }
    $query->remember(5);
    $data = $query->get();

    return array( 'statements' => $statements, 
                  'data'       => $data, 
                  'filter'     => $filter );

  }

  /**
   *
   * Loop through passed parameters and add to DB query. Used when 
   * filtering statements on the site.
   * 
   * @todo only decode on urls not everything
   *
   * @param string $filter
   * @param object $query
   * 
   * @return object $query
   *
   */
  private function setWhere( $filter, $query ){

    foreach( $filter as $k => $v ){
      $k = $this->filterKeyLookUp( $k );
      $query->where( $k, rawurldecode( $v ) );
    }
    return $query;

  }

  /**
   *
   * Set a restriction for the query if one was passed
   *
   * @param $restriction
   * @param $query
   *
   * @return
   *
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

  /**
   *
   * A look up service to grab xAPI key based on url key.
   *
   * @param  string $key
   * @return string 
   *
   */
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

  /**
   *
   * Add parameters to statements query. This is used via xAPI GET 
   * statements.
   * 
   * These allowed parameters are detemined by the xAPI spec see
   * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#stmtapi
   * 
   * @param object $statement  The statement query
   * @param array  $parameters The parameters to add
   *
   */
  private function addParameters( $statements, $parameters ){


    //Check if agent has been passed
    if( isset($parameters['agent']) ){

      $agent_param = !is_object($parameters['agent']) ? json_decode($parameters['agent']) : $parameters['agent']; //convert to object if not already

      if( is_array($agent_param) ){ //if array, apply OR filtering to agents

        $statements = $statements->where( function($query) use ($agent_param){ //only apply ORs within agents
          foreach( $agent_param as $agent ){ //for each agent
            $query = $this->setAgent($query, $agent, true); //set agent with orWhere
          }
        });

      } else if( is_object($agent_param) ){

        $statements = $this->setAgent( $statements, $agent_param ); //do query on single agent

      }

    }
    
    //set verb, if none passed ust make sure no voided statements are sent
    if( isset($parameters['verb']) ){
      $statements->where( 'verb.id', $parameters['verb'] );
    }else{
      $statements->where( 'verb.id', '<>', 'http://adlnet.gov/expapi/verbs/voided');
    }

    if( isset($parameters['registration']) ){
      $statements->where( 'context.registration', $parameters['registration'] );
    }

    if( isset($parameters['activity']) ){
      $statements->where( 'object.id', $parameters['activity']);
    }

    //since, until or between
    if( isset($parameters['until']) && isset($parameter['since']) ){

      $statements->whereBetween('timestamp', array($parameter['since'], $parameters['until']));

    }elseif( isset($parameter['since']) ){

      $statements->where( 'timestamp', '>', $parameter['since'] );

    }elseif( isset($parameter['since']) ){

      $statements->where( 'timestamp', '<', $parameter['until'] );
      
    }

    //@todo related_activities - look in sub-statements

    //@todo related_agents - look in sub-statements

    //@todo format
    $allowed_formats = array( 'ids', 'exact', 'canonical' );
    if( isset($parameter['format']) && in_array($parameter['format'], $allowed_formats) ){

      //if ids then return minimum details for agent, activity and group objects

      //if exact - return as stored

      //if canonical, get language from Accept-Language header and only return language maps matching

    }

    //@todo attachments



    $server_statement_limit = 100;

    if( isset( $parameters['limit'] ) ){
      $limit = intval($parameters['limit']);
      if( $limit === 0 ){
        $statements->take( $server_statement_limit ); //server set limit
      } else {
        $statements->take( $limit );
      }
    } else {
      $statements->take( $server_statement_limit );
    }
         
    if( isset( $parameters['offset'] ) ){
      $statements->skip( $parameters['offset'] );
    }

    if( isset( $parameters['ascending'] ) ){
      $statements->orderBy('stored', 'asc');
    }else{
      $statements->orderBy('stored', 'desc');
    }

    return $statements;

  }

  public function timeGrouping($query, $interval ){

    return $query;
  }

  public function actorGrouping($query){
    
    $query->aggregate(
      array('$match' => array()),
      array(
        '$group' => array(
          '_id' => 'actor.mbox'
        )
      )
    );

    dd( $query );

    return $query;
  }

  /**
   * When agent json is passed, get correct identifier
   *
   * @param @query  The query in question - called from all and find.
   * @param @agent  The agent json object
   *
   * @return $query
   * 
   */
  public function setAgent( $query, $agent, $or = false ){

    $agent_query = '';

    $where_type = $or ? 'orWhere' : 'where';

    if( is_string($agent) ){
      $agent = json_decode($agent);
    }

    //Do some checking on what actor field we are filtering with
    if( isset($agent->mbox) ){ //check for mbox

        $agent_query = array('field' => 'actor.mbox', 'value'=>$agent->mbox);

    } else if( isset($agent->mbox_sha1sum) ) {//check for mbox_sha1sum

      $agent_query = array('field' => 'actor.mbox_sha1sum', 'value'=>$agent->mbox_sha1sum);

    } else if( isset($agent->openid) ){ //check for open id

      $agent_query = array('field' => 'actor.openid', 'value'=>$agent->openid);

    }

    if( isset($agent_query) && $agent_query != '' ){ //if we have agent query params lined up...

      $query->$where_type( $agent_query['field'], $agent_query['value'] );

    } else if( isset($agent->account) ){ //else if there is an account

      if( isset($agent->account->homePage) && isset($agent->account->name ) ){

        $query->$where_type( function($query){
          $query->where('actor.account.homePage', $agent->account->homePage)
                ->where('actor.account.name', $agent->account->name );
        });

      } 

    } 

    return $query;
  }

  /**
   * Check to see if a submitted statementId already exist and if so
   * are the two statements idntical? If not, return true.
   *
   * @param uuid   $id
   * @param string $lrs
   * @return boolean
   *
   **/
  private function doesStatementIdExist( $lrs, $id, $statement ){

    $exists = $this->statement->where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $lrs)
              ->where('id', $id)
              ->first();
    
    if( $exists ){
      if( array_multisort( $exists->toArray() ) === array_multisort( $statement ) ){
        return 'conflict-matches';
      }
      return 'conflict-nomatch';
    }

    return false;

  }

}
