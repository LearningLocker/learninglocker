<?php namespace Controllers\xAPI;

use \Locker\Repository\Statement\StatementRepository as Statement;
use \App\Locker\Helpers\Attachments;

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

    $this->beforeFilter('@checkVersion', array('except' => 'index'));
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

    //get content type header
    $content_type = \Request::header('content-type');

    // get the actual content type
    $get_type = explode(";", $content_type, 2);
    if( sizeof($get_type) >= 1 ){
      $mimeType = $get_type[0];
    } else {
      $mimeType = $get_type;
    }
    
    //if mimetype multipart/mixed then we are dealing with physical attachments
    if( $mimeType == 'multipart/mixed'){
      //get statements and reset $incoming_statement
      $components = Attachments::setAttachments( $content_type, $incoming_statement );
      if( empty($components) ){
        return \Response::json( array( 'error'    => true, 
                                       'message'  => 'There is a problem with the formatting of your submitted content.'), 
                                        400 );
      }
      $incoming_statement = $components['body'];
      //if no attachments, abort
      if( !isset($components['attachments']) ){
        return \Response::json( array( 'error'    => true, 
                                       'message'  => 'There were no attachments.'), 
                                        403 );
      }
      $attachments = $components['attachments'];
      
    }else{
      $attachments = '';
    }

    $statements_assoc = json_decode($incoming_statement, TRUE);

    if( is_array(json_decode($incoming_statement)) ){
      $statements = $statements_assoc;
    } else {
      $statements = array( $statements_assoc );
    }
      
    $save = $this->saveStatement( $statements, $attachments );
    return $this->sendResponse( $save );

  }

  /**
   * Save statements in the DB
   *
   * @param json $incoming_statement
   * @param array $attachments
   * @return response
   */
  public function saveStatement( $statements, $attachments = '' ){
  
    $save = $this->statement->create( $statements, $this->lrs, $attachments );
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
    $statement          = json_decode($incoming_statement, TRUE);
    

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

  public function grouped(){
    $results = $this->statement->grouped( $this->lrs->_id, $this->params );

    return $this->returnArray( $results, $this->params );
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
      return $this->returnArray( array($statement->toArray()) );
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

    $statement_lrs = $statement['lrs']['_id'];

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
  public function returnArray( $statements=array(), $params=array(), $debug=array() ){

    $array = array(
      'X-Experience-API-Version' =>  \Config::get('xapi.using_version')
    );


    //replace replace &46; in keys with . 
    //see http://docs.learninglocker.net/docs/statements#quirks for more info
    if( !empty($statements) ){
      foreach( $statements as &$s ){
        $s = \app\locker\helpers\Helpers::replaceHtmlEntity( $s['statement'] );
      }
    }
    
    $array['statements'] = $statements;

    //return total available statements
    $array['total'] = $this->statement->count( $this->lrs->_id, $this->params );

    //set more link. 100 is our default limit. This should be a value that admins can
    //set, not hardcoded.
    if( isset($this->params['offset']) ){
      if( isset($this->params['limit']) ){
        $offset = $this->params['offset'] + $this->params['limit'];
      }else{
        $offset = $this->params['offset'] + 100;
      }
    }else{
      if( isset($this->params['limit']) ){
        $offset = $this->params['limit'];
      }else{
        $offset = 100;
      }
    }

    //set the more url
    if( $array['total'] > $offset ){
      $url = 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . "{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}";
      if( isset($this->params) ){
        if( isset($this->params['offset']) && count($this->params) > 1 ){
          $url = str_replace('&offset=' . $this->params['offset'], "", $url);
          $url = $url . '&offset=' . $offset;
        }elseif(isset($this->params['offset'])) {
          $url = str_replace('?offset=' . $this->params['offset'], "", $url);
          $url = $url . '?offset=' . $offset;
        }else{
          $url = $url . '&offset=' . $offset;
        }
      }else{
        $url = $url . '?offset=' . $offset;
      }
      $array['more'] = $url;
    }

    $response = \Response::make( $array, 200 );

    //set consistent through data
    $current_date = \DateTime::createFromFormat('U.u', microtime(true));
    $current_date->setTimezone(new \DateTimeZone(\Config::get('app.timezone')));
    $current_date = $current_date->format('Y-m-d\TH:i:s.uP');

    $response->headers->set('X-Experience-API-Consistent-Through', $current_date);

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
