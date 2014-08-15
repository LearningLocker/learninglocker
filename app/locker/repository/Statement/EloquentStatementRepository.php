<?php namespace Locker\Repository\Statement;

use DateTime;
use Statement;
use Locker\Repository\Activity\ActivityRepository as Activity;
use Locker\Repository\Query\QueryRepository as Query;
use Locker\Repository\Document\FileTypes;

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
    $this->query     = $query;

  }

  /**
   * Count statements for any give lrs
   *
   * @param string Lrs
   * @param array parameters Any parameters for filtering
   * @return count
   *
   **/
  public function count( $lrs, $parameters=null ){
    $query = $this->statement->where('lrs._id', $lrs);

    if( !is_null($parameters)){
      $this->addParameters( $query, $parameters, true );
    }

    return $query->remember(5)->count();
  }

  /**
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
  public function all( $lrs, $parameters ){ 

    $statements = $this->statement->where('lrs._id', $lrs);

    $this->addParameters( $statements, $parameters );

    $getStatements = $statements->get();

    //get Related Agents
    if( isset($parameters['related_agents']) && $parameters['related_agents'] == 'true' && isset($parameters['agent']) ){
      $getStatements = $this->relatedAgents($getStatements, $lrs, $parameters['agent']);
    }

    //get Related Activities
    if( isset($parameters['related_activities']) && $parameters['related_activities'] == 'true' && isset($parameters['activity']) ){
      $getStatements = $this->relatedActivities($getStatements, $lrs, $parameters['activity']);
    }

    //now get all statements linked via StatementRef
    $getStatements = $this->getLinkedStatements( $getStatements, $lrs );

    return $getStatements;

  }

  public function grouped($id, $parameters){

    $type = isset($parameters['grouping']) ? strtolower($parameters['grouping']) : '';
    
    switch( $type ){
      default:
      case "time":
        $interval = isset($parameters['interval']) ? $parameters['interval'] : "day";
        $filters = isset($parameters['filters']) ? json_decode($parameters['filters'], true) : array();

        //overwrite the LRS filter
        $filters['lrs._id'] = $id;

        $results = $this->query->timedGrouping( $filters, $interval );
      break;
      case "actor":
        //@todo
      break;
      case "activity":
        //@todo
      break;
      case "verb":
        //@todo
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

    return \Statement::where('statement.id', $id)->first();

  }

  /*
  |-----------------------------------------------------------------------
  | Store incoming xAPI statements
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
  public function create( $statements, $lrs, $attachments='' ){

    //Full tincan statement validation to make sure the statement conforms
    
    $saved_ids = array();
    $site = \Site::first();
    $authority = [
      "name" => $site->name,
      "mbox" => "mailto:" . $site->email,
      "objectType" => "Agent"
    ]; 
    foreach( $statements as &$statement ){ //loop and amend - return on fail

      $verify = new \app\locker\statements\xAPIValidation();

      //run full validation
      $return = $verify->runValidation( $statement, $authority );

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

      //The date stored in LRS in ISO 8601 format
      $current_date = DateTime::createFromFormat('U.u', microtime(true));
      $current_date->setTimezone(new \DateTimeZone(\Config::get('app.timezone')));
      $vs['stored'] = $current_date->format('Y-m-d\TH:i:s.uP');

      //if no timestamp, make it the same as stored
      if( !isset($vs['timestamp']) ){
        $vs['timestamp'] = $vs['stored'];
      }
       
      /*
      |------------------------------------------------------------------------------
      | For now we store the latest submitted definition. @todo this will change
      | when we have a way to determine authority to edit.
      |------------------------------------------------------------------------------
      */
      if( isset($vs['object']['definition'])){
        $this->activity->saveActivity( $vs['object']['id'], $vs['object']['definition'] );
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
      $new_statement->lrs = array( '_id'  => $lrs->_id, 'name' => $lrs->title );
      $new_statement->statement = $vs;

      //now add our MongoData timestamp (based on statement timestamp) to use with Mongo Aggregation Function
      $new_statement->timestamp = new \MongoDate(strtotime($vs['timestamp']));

      if( $new_statement->save() ){

        $saved_ids[] = $new_statement->statement['id'];

      } else {
        return array( 'success' => 'false', 
                      'message' => $new_statement->errors );
      }

      
    }

    //now we have saved statements, store attachments
    if( $attachments != '' ){
      $this->storeAttachments( $attachments, $lrs->_id );
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
   * Return statements with no filter for a particular LRS.
   *
   * @param int $id The LRS _id.
   *
   * @return array of statements.
   * 
   */
  public function statements( $id ){

    return \Statement::where('lrs._id', $id)
           ->orderBy('statement.stored', 'desc')
           ->paginate(15);

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
  private function addParameters( $statements, $parameters, $count=false ){

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
      $statements->where( 'statement.verb.id', $parameters['verb'] );
      $statements->orWhere( 'statement.verb.id', '<>', 'http://adlnet.gov/expapi/verbs/voided');
    }else{
      $statements->where( 'statement.verb.id', '<>', 'http://adlnet.gov/expapi/verbs/voided');
    }

    if( isset($parameters['registration']) ){
      $statements->where( 'statement.context.registration', $parameters['registration'] );
    }

    if( isset($parameters['activity']) ){
      $statements->where( 'statement.object.id', $parameters['activity'])->where('statement.object.objectType', 'Activity');
    }

    //since, until or between
    if( isset($parameters['until']) && isset($parameters['since']) ){
      $statements->whereBetween('statement.timestamp', array($parameters['since'], $parameters['until']));
    }elseif( isset($parameters['since']) ){
      $statements->where( 'statement.timestamp', '>', $parameters['since'] );
    }elseif( isset($parameters['since']) ){
      $statements->where( 'statement.timestamp', '<', $parameters['until'] );
    }

    //Format
    $allowed_formats = array( 'ids', 'exact', 'canonical' );
    if( isset($parameters['format']) && in_array($parameters['format'], $allowed_formats) ){

      //if ids then return minimum details for agent, activity and group objects
      if( $parameters['format'] == 'ids' ){
        $statements->select('statement.id', 'statement.actor.mbox', 'statement.verb.id', 'statement.object.id', 'statement.object.objectType');
      }

      //if exact - return as stored
      if( $parameters['format'] == 'exact' ){
        //return as is
      }

      //if canonical, get language from Accept-Language header and only return language maps matching
      if( $parameters['format'] == 'canonical' ){
        //@todo
      }
    }

    //@todo attachments
    if(!$count){
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

      if( isset( $parameters['ascending'] ) && $parameters['ascending'] == 'true' ){
        $statements->orderBy('statement.stored', 'asc');
      }else{
        $statements->orderBy('statement.stored', 'desc');
      }
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
          '_id' => 'statement.actor.mbox'
        )
      )
    );

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
      $agent_query = array('field' => 'statement.actor.mbox', 'value'=>$agent->mbox);
    } else if( isset($agent->mbox_sha1sum) ) {//check for mbox_sha1sum
      $agent_query = array('field' => 'statement.actor.mbox_sha1sum', 'value'=>$agent->mbox_sha1sum);
    } else if( isset($agent->openid) ){ //check for open id
      $agent_query = array('field' => 'statement.actor.openid', 'value'=>$agent->openid);
    }

    if( isset($agent_query) && $agent_query != '' ){ //if we have agent query params lined up...
      $query->$where_type( $agent_query['field'], $agent_query['value'] );
    } else if( isset($agent->account) ){ //else if there is an account
      if( isset($agent->account->homePage) && isset($agent->account->name ) ){
        
        if( $or ){
          /*
          // This has been deprecated because `use` currently doesn't work.
          // However this code is unused at the time of deprecation.
          $query->$where_type( function($query) use ($agent) {
            $query->where('statement.actor.account.homePage', $agent->account->homePage)
                  ->where('statement.actor.account.name', $agent->account->name );
          });*/
          \App::abort(501, "Learning Locker does not current support `OR` queries with accounts.");
        } else {
          $query->where('statement.actor.account.homePage', $agent->account->homePage)
            ->where('statement.actor.account.name', $agent->account->name );
        }


      } 
    } 

    if( isset($agent->name) ){
      $query->$where_type('statement.actor.name', $agent->name);
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

    $exists = $this->statement->where('lrs._id', $lrs)
              ->where('statement.id', $id)
              ->first();
    
    if ($exists) {
        $saved_statement = (array)$exists['statement'];
        unset($saved_statement['stored']);
        array_multisort($saved_statement);
        array_multisort($statement);
        ksort($saved_statement);
        ksort($statement);
    
        if ($saved_statement == $statement) {
            return 'conflict-matches';
        }
    
        return 'conflict-nomatch';
    }

    return false;

  }

  /**
   * Get all chained statements via StatementRef
   * Details https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#filter-conditions-for-statementrefs
   *
   * Recursive function to drill through all statements.
   *
   * @param $statements object 
   * @param $lrs int
   *
   * @return $statements object
   *
   **/
  private function getLinkedStatements( $statements, $lrs ){
    $ids = array();
    if( $statements ){
      //get statement ids
      foreach($statements as $s){
        $ids[] = $s->id;
      }
      foreach( $statements as $s ){
        $getConnected = $this->getConnected( $s->id, $lrs );

        if( $getConnected ){
          //add new statements to statements return, if
          //the statement is not already in the return object.
          foreach($getConnected as $c ){
            if( !in_array($c->id, $ids) ){
              $statements[] = $c;
            }
          }
          //check these statements for connected statements
          $this->getLinkedStatements( $getConnected, $lrs );
        }
        
      }

      // $getConnected = Statement::where('lrs._id', $lrs)
      //                 ->whereIn('object.id', $ids)
      //                 ->get();

      // if( $getConnected ){
      //   //add new statements to statements return, if
      //   //the statement is not already in the return object.
      //   foreach($getConnected as $c ){
      //     if( !in_array($c->id, $ids) ){
      //       $statements[] = $c;
      //     }
      //   }
      //   //check these statements for connected statements
      //   $this->getLinkedStatements( $getConnected, $lrs );
      // }

    }
    return $statements;
  }

  /**
   * Grab stateent from DB. Called from getLinkedStatements
   *
   * @param $id int StatementRef ID
   * @param $lrs int LRS in question
   *
   * @return $statements
   **/ 
  private function getConnected( $id, $lrs ){
    return \Statement::where('lrs._id', $lrs)->where('statement.object.id', $id)->get();
  }

  /**
   * Related Actors
   *
   * @param $statements object 
   *
   * @return $statements 
   *
   **/
  private function relatedAgents($statements, $lrs, $actor){

    $actor = json_decode($actor);

    //Do some checking on what actor field we are filtering with
    if( isset($actor->mbox) ){ //check for mbox
      $query = $actor->mbox;
      $query_type = 'mbox';
    } else if( isset($actor->mbox_sha1sum) ) {//check for mbox_sha1sum
      $query = $actor->mbox_sha1sum;
      $query_type = 'mbox_sha1sum';
    } else if( isset($actor->openid) ){ //check for open id
      $query = $actor->openid;
      $query_type = 'openid';
    } else if( isset($actor->account) ){ //else if there is an account
      $query = $actor->account;
      $query_type = 'account';
    }

    $authority  = 'statement.authority.' . $query_type;
    $object     = 'statement.object.' . $query_type;
    $teams      = 'statement.context.team.' . $query_type;
    $instructor = 'tatement.context.instructor.' . $query_type;

    $ids = array();

    if( $statements ){
      //get statement ids
      foreach($statements as $s){
        $ids[] = $s->id;
      }
      
      //look in authority
      $authority = \Statement::where('lrs._id', $lrs)->where($authority, $query)->get();
      if( $authority ){
        $statements = $this->addStatements( $statements, $authority, $ids );
      }

      //look in object where objectType = Agent
      $object = \Statement::where('lrs._id', $lrs)->where($object, $query)->get();
      if( $object ){
        $statements = $this->addStatements( $statements, $object, $ids );
      }

      //look in team
      $teams = \Statement::where('lrs._id', $lrs)->where($teams, $query)->get();
      if( $object ){
        $statements = $this->addStatements( $statements, $teams, $ids );
      }

      //look in instructor
      $instructor = \Statement::where('lrs._id', $lrs)->where($instructor, $query)->get();
      if( $object ){
        $statements = $this->addStatements( $statements, $instructor, $ids );
      }
      
    }

    return $statements;
  }

  /**
   * Related Activities
   *
   **/
  private function relatedActivities($statements, $lrs, $activityId){

    $ids = array();
    foreach($statements as $s){
      $ids[] = $s->id;
    }

    //look in context parent
    $parent = \Statement::where('lrs._id', $lrs)
              ->where('statement.context.contextActivities.parent.objectType', 'Activity')
              ->where('statement.context.contextActivities.parent.id', $activityId)
              ->get();

    if( $parent ){
      $statements = $this->addStatements( $statements, $parent, $ids );
    }
    //look in context grouping
    $grouping = \Statement::where('lrs._id', $lrs)
                ->where('statement.context.contextActivities.grouping.objectType', 'Activity')
                ->where('statement.context.contextActivities.grouping.id', $activityId)
                ->get();

    if( $grouping ){
      $statements = $this->addStatements( $statements, $grouping, $ids );
    }
    //look in context category
    $category = \Statement::where('lrs._id', $lrs)
                ->where('statement.context.contextActivities.category.objectType', 'Activity')
                ->where('statement.context.contextActivities.category.id', $activityId)
                ->get();

    if( $category ){
      $statements = $this->addStatements( $statements, $category, $ids );
    }
    //look in context other
    $other= \Statement::where('lrs._id', $lrs)
                ->where('statement.context.contextActivities.other.objectType', 'Activity')
                ->where('statement.context.contextActivities.other.id', $activityId)
                ->get();

    if( $category ){
      $statements = $this->addStatements( $statements, $other, $ids );
    }
   
    return $statements;
  }

  /**
   * Loop and add additional statements to main statement object
   *
   * @param $statements
   * @param $additional_statements
   * @param $ids
   *
   * @return $statements
   **/
  private function addStatements( $statements, $additional_statements, $ids ){
    if( $additional_statements ){
      foreach($additional_statements as $s){
        //don't include duplicates
        if( !in_array($s->id, $ids) ){
          $statements[] = $s;
        }
      }
    }
    return $statements;
  }

  /**
   * Store any attachments
   *
   **/
  private function storeAttachments( $attachments, $lrs ){

    foreach( $attachments as $a ){

      // Separate body contents from headers
      $a = ltrim($a, "\n");
      list($raw_headers, $body) = explode("\n\n", $a, 2);

      // Parse headers and separate so we can access
      $raw_headers = explode("\n", $raw_headers);
      $headers     = array();
      foreach ($raw_headers as $header) {
        list($name, $value) = explode(':', $header);
        $headers[strtolower($name)] = ltrim($value, ' '); 
      }

      //get the correct ext if valid
      $ext = array_search( $headers['content-type'], FileTypes::getMap() );
      if( $ext === false ){
        \App::abort(400, 'This file type cannot be supported');
      }

      $filename = str_random(12) . "." . $ext;
      
      //create directory if it doesn't exist
      if (!\File::exists(base_path().'/uploads/'.$lrs.'/attachments/' . $headers['x-experience-api-hash'] . '/')) {
        \File::makeDirectory(base_path().'/uploads/'.$lrs.'/attachments/' . $headers['x-experience-api-hash'] . '/', 0775, true);
      }

      $destinationPath = base_path().'/uploads/'.$lrs.'/attachments/' . $headers['x-experience-api-hash'] . '/';

      $filename = $destinationPath.$filename; 
      $file = fopen( $filename, 'wb'); //opens the file for writing with a BINARY (b) fla
      $size = fwrite( $file, $body ); //write the data to the file
      fclose( $file );

      if( $size === false ){
        \App::abort( 400, 'There was an issue saving the attachment');
      }
    }

  }
}
