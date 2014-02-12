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
    $this->beforeFilter('@setParameters', array('except' => 'store'));
    $this->beforeFilter('@reject', array('except' => 'store'));

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
  
    //convert to array
    $statement = json_decode($incoming_statement, TRUE);

    // Save the statement
    $save = $this->statement->create( $statement, $this->lrs );

    if( $save['success'] ){
      return $this->returnSuccessError( true, $save['id'], '200' );
    }else{
      return $this->returnSuccessError( false, implode($save['message']), '400' );
    }

  }

  /**
   * Update the specified resource in storage.
   *
   * @param  int  $id
   * @return Response
   */
  public function update(){}

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
      return $this->returnSuccessError( false, 'You are not authorized to access this statement.', 403 );
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
   * Run a check to make sure critria are being met, if not, reject
   * with a 400.
   *
   **/
  public function reject(){

    //first check that statementId and voidedStatementId
    //have not been requested.
    if (array_key_exists("statementId", $this->params) AND array_key_exists("voidedStatementId", $this->params)) {

      return $this->returnSuccessError( false, 'You can\'t request based on both statementId and voidedStatementId', 400 );

    }

    //The LRS MUST reject with an HTTP 400 error any requests to this resource 
    //which contain statementId or voidedStatementId parameters, and also contain any other 
    //parameter besides "attachments" or "format".

    if (array_key_exists("statementId", $this->params) OR array_key_exists("voidedStatementId", $this->params)) {

      $allowed_params = array('attachments', 'format');

      foreach( $this->params as $k => $v ){
        if( $k != 'statementId' && $k != 'voidedStatementId' && !in_array( $k, $allowed_params) ){
          return $this->returnSuccessError( false, 'When using statementId or voidedStatementId, the only other 
            parameters allowed are attachments and/or format.', 400 );
        }
      }

    }

  }

}