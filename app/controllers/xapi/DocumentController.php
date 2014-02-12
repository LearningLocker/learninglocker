<?php namespace Controllers\xAPI;

use \Locker\Repository\Document\DocumentRepository as Document;

class DocumentController extends BaseController {

  /**
  * Document Repository
  */
  protected $document, $document_type;

  /**
   * Construct
   *
   * @param DocumentRepository $document
   */
  public function __construct(Document $document){
    $this->document = $document;
    $this->beforeFilter('@getLrs');
    $this->beforeFilter('@setParameters');
  }

  /**
   * Used to filter required paramters on an incoming request
   * @param  array  $required a list of expected parameters and allows types
   * @param  array  $optional a list of optional parameters in required
   * @param
   *
   * @return array
   * 
   */
  public function checkParams( $required = array(), $optional=array(), $data = null ){

    $return_data = array();

    if( is_null($data) ){
      $data = $this->params;
    }

    //loop through all required parameters
    foreach( $required as $name=>&$expected_types ){
      //check the parameter has been passed
      if( !isset($data[$name]) ){
        \App::abort(400, 'Required parameter is missing - '.$name );
      }

      if( !empty($expected_types) ){
        $value = $this->checkTypes( $name, $data[$name], $expected_types );
      } else {
        $value = $data[$name];
      }

      $return_data[$name] = $value;
    }

    foreach( $optional as $name=>&$expected_types ){

      if( isset($data[$name]) ){
        $value = ( !empty($expected_types) ) ? $this->checkTypes( $name, $data[$name], $expected_types ) : $data[$name];
      } else {
        $value = null;
      }

      $return_data[$name] = $value;
    }

    return $return_data;
  }

  /**
   * Check types submitted to ensure allowed
   * 
   */
  public function checkTypes($name, $value, $expected_types ){

    //convert expected type string into array
    $expected_types = ( is_string($expected_types) ) ? array($expected_types) : $expected_types;

    //get the paramter type
    $type = gettype($value);

    //error on any unexpected parameter types
    if( !in_array( $type, $expected_types ) ){
      \App::abort(400, sprintf( "`%s` is not an accepted type - expected %s - received %s", $name, implode(',', $expected_types), $type ) );
    }

    //Check if we have requested a JSON parameter
    if( in_array('json', $expected_types ) ){
      $value = json_decode($value);
      if( !is_object( $value ) ){
        \App::abort(400, sprintf( "`%s` is not an accepted type - expected a JSON formatted string", $name ) );
      }
    }

    //Check if we have a timestamp paramater
    if( in_array('timestamp', $expected_types ) ){
      if ( !$this->validateTimestamp($value) ){
        \App::abort(400, sprintf( "`%s` is not an accepted type - expected an ISO 8601 formatted timestamp", $name ) );
      }
    }

    return $value;
  }

  public function validateTimestamp($timestamp){
    if (!preg_match('/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/', $timestamp) > 0) {
      return false;
    }

    return true;
  }

}