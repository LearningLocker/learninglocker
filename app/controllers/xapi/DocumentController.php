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
				$this->checkTypes( $name, $data[$name], $expected_types );
			}

			$return_data[$name] = $data[$name];
		}

    foreach( $optional as $name=>&$expected_types ){
      if( isset($data[$name]) ){
        if( !empty($expected_types) ){
          $this->checkTypes( $name, $data[$name], $expected_types );
        }
        
        $return_data[$name] = $data[$name];
      }
    }

		return $return_data;
	}

  public function checkTypes($name, $value, $expected_types ){

    //convert expected type string into array
    $expected_types = ( is_string($expected_types) ) ? array($expected_types) : $expected_types;

    //get the paramter type
    $type = gettype($value);

    //error on any unexpected parameter types
    if( !in_array( $type, $expected_types ) ){
      \App::abort(400, sprintf( "`%s` is not an accepted type - expected %s - received %s", $name, implode(',', $expected_types), $type ) );
    }

    //Check if we haev requested a JSON parameter
    if( in_array('json', $expected_types ) ){
      if( !is_object( json_decode($value) ) ){
        \App::abort(400, sprintf( "`%s` is not an accepted type - expected a JSON formatted string", $name ) );
      }
    }
  }



}
