<?php namespace Controllers\xAPI;

use \Locker\Repository\Statement\StatementRepository as Statement;

class StatementsController extends BaseController {

  /**
  * Statement Repository
  */
  protected $statement;

  /**
   * Current LRS based on Auth credentials
   **/
  protected $lrs;

  /**
   * Filter parameters
   **/
  protected $params;


  /**
   * Construct
   *
   * @param StatementRepository $statement
   */
  public function __construct(Statement $statement){

    $this->statement = $statement;

    $this->beforeFilter('@checkVersion');
    $this->beforeFilter('@getLrs');
    $this->beforeFilter('@setParameters', array('except' => 'store', 'put'));
    $this->beforeFilter('@reject', array('except' => 'store', 'put'));

  }

  /**
   * Store a newly created resource in storage.
   *
   * @todo handle mulitple incoming statements
   *
   * @return Response
   */
  public function store(){

    //grab incoming statement
    $request            = \Request::instance();
    $incoming_statement = $request->getContent();
    $statements_assoc = json_decode($incoming_statement, TRUE);

    if( is_array(json_decode($incoming_statement)) ){
      $statements = $statements_assoc;
    } else {
      $statements = array( $statements_assoc );
    }
    

    //@todo if incoming is an array of statements, loop through
    $save = $this->saveStatement( $statements );
    return $this->sendResponse( $save );

  }

  /**
   * Save a single statement in the DB
   *
   * @param json $incoming_statement
   * @return response
   */
  public function saveStatement( $statements ){
  
    $save = $this->statement->create( $statements, $this->lrs );
    return $save;

  }

  /**
   * Stores Statement with the given id.
   *
   * @param  int  $id
   * @return Response
   */
  public function storePut(){

    $request            = \Request::instance();
    $incoming_statement = $request->getContent();
    $statement         = json_decode($incoming_statement, TRUE);
    

    //if no id submitted, reject
    if( !isset($statement['id']) ) return $this->sendResponse( array('success' => 'noId') );

    $save = $this->saveStatement( array($statement) );

    if( $save['success'] == 'true' ){
      return $this->sendResponse( array('success' => 'put') );
    }

    return $this->sendResponse( $save );

  }

  /**
   * Display a listing of the resource.
   *
   * @return Response
   */
  public function index(){

    //If the statementId or voidedStatementId parameter is specified a 
    //single Statement is returned.
    if( isset($this->params['statementId'] ) ){
      return $this->show( $this->params['statementId'] );
    }

    if( isset($this->params['voidedStatementId'] ) ){
      return $this->show( $this->params['voidedStatementId'] );
    }

    $statements = $this->statement->all( $this->lrs->_id, $this->params );

    return $this->returnArray( $statements->toArray(), $this->params );

  }

  /**
   * Display the specified resource.
   *
   * @param  int  $id  This can be statementId or voidedStatementId
   * @return View
   */
  public function show( $id ){

    $statement = $this->statement->find( $id );
    
    //can the requester access this statement?
    if( $this->checkAccess( $statement ) ){
      return $this->returnArray( $statement->toArray() );
    }else{
      return \Response::json( array( 'error'    => true, 
                                     'message'  => 'You are not authorized to access this statement.'), 
                                     403 );
    }
    
  }

  /**
   * This is used when retriving statements. Make sure any 
   * statements requested are in the LRS relating to the 
   * credentials used to authenticate.
   *
   * @param object Statement
   * @return boolean
   **/
  public function checkAccess( $statement ){

    $statement_lrs = $statement['context']['extensions']['http://learninglocker&46;net/extensions/lrs']['_id'];

    if( $statement_lrs == $this->lrs->_id ){
      return true;
    }

    return false;

  }

  /**
   * Build the required return array for a single or multiple statements.
   *
   * @param array $statements  Statements to return
   * @param array $params      Parameters used to filter statements
   *
   * @return response
   *
   **/
  public function returnArray( $statements=array(), $params=array() ){

    $array = array(
      'X-Experience-API-Version' =>  \Config::get('xapi.using_version'),
      'route'                    =>  \Request::path()
    );

    $array['params'] = $params;

    //replace replace &46; in keys with . 
    //see https://github.com/LearningLocker/LearningLocker/wiki/A-few-quirks for more info
    if( !empty($statements) ){
      foreach( $statements as &$s ){
        $s = \app\locker\helpers\Helpers::replaceHtmlEntity( $s );
      }
    }
    
    $array['statements'] = $statements;

    //$array['more'] = '';// @todo if more results available, provide link to access them

    $response = \Response::make( $array, 200 );
    $response->headers->set('X-Experience-API-Consistent-Through', 'now');

    return $response;
    
  }

  /**
   * Set and send back approriate response.
   *
   * @param array $outcome 
   * @return response
   **/
  public function sendResponse( $outcome ){

    switch( $outcome['success'] ){
      case 'true': 
        return \Response::json( $outcome['ids'], 200 );
        break;
      case 'conflict-nomatch':
        return \Response::json( array('success'  => false), 409 );
        break;
      case 'conflict-matches':
        return \Response::json( array(), 204 );
        break;
      case 'put':
        return \Response::json( array('success'  => true), 204 );
        break;
      case 'noId':
        return \Response::json( array('success'  => false, 'message' => 'A statement ID is required to PUT.'), 400 );
        break;
      case 'false':
        return \Response::json( array( 'success'  => false, 
                                       'message'  => implode($outcome['message'])), 
                                       400 );
        break;

    }
   
  }

  /**
   * Run a check to make sure critria are being met, if not, reject
   * with a 400.
   *
   **/
  public function reject(){

    if( $this->method !== "PUT" && $this->method !== "POST" ){

      //first check that statementId and voidedStatementId
      //have not been requested.
      if (array_key_exists("statementId", $this->params) 
        AND array_key_exists("voidedStatementId", $this->params)) {

        return \Response::json( array( 'error'    => true, 
                                       'message'  => 'You can\'t request based on both 
                                                      statementId and voidedStatementId'), 
                                       400 );
      }

      //The LRS MUST reject with an HTTP 400 error any requests to this resource 
      //which contain statementId or voidedStatementId parameters, and also contain any other 
      //parameter besides "attachments" or "format".

      if (array_key_exists("statementId", $this->params) 
        OR array_key_exists("voidedStatementId", $this->params)) {

        $allowed_params = array('attachments', 'format');

        foreach( $this->params as $k => $v ){
          if( $k != 'statementId' && $k != 'voidedStatementId' && !in_array( $k, $allowed_params) ){
            return \Response::json( array( 'error'    => true, 
                                           'message'  => 'When using statementId or voidedStatementId, the only other 
                                                          parameters allowed are attachments and/or format.'), 
                                           400 );
          }
        }
      }

    }

  }

}