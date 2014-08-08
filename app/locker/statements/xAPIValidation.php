<?php 
/*
|-----------------------------------------------------------------------------------
|
| Validate TinCan (xAPI) statements. You can read more about the
| standard here http://www.adlnet.gov/wp-content/uploads/2013/05/20130521_xAPI_v1.0.0-FINAL-correx.pdf
|
| This class covers version 1.0.0 and was built as part of the HT2 Learning Locker project.
| http://learninglocker.net
|
| @author Dave Tosh @davetosh
| @copyright HT2 http://ht2.co.uk
| @license MIT http://opensource.org/licenses/MIT
|
|-----------------------------------------------------------------------------------
*/

namespace app\locker\statements;

class xAPIValidation {

  private $status    = 'passed'; //status of the submitted statement. passed or failed.
  private $errors    = array();  //error messages if validation fails
  private $statement = array();  //the statement submitted
  private $subStatement = array();

  /**
   * Constructor
   */
  public function __construct(){}

  /**
   * Validator
   *
   * Run a full validation on submitted statement.
   * @param  array   $statement    The statement.
   * @param  array   $authority      The authority storing statement.
   *
   * @return array An array containing status, errors (if any) and the statement
   * 
   */
  public function runValidation( $statement='', $authority='' ) {

    $this->statement = $statement;

    $this->getStarted( $statement );

    foreach( $statement as $k => $v ){

      switch( $k ){
        case 'actor':       $this->validateActor( $v );       break;
        case 'verb':        $this->validateVerb( $v );        break;
        case 'object':      $this->validateObject( $v );      break;
        case 'context':     $this->validateContext( $v );     break;
        case 'timestamp':   $this->validateTimestamp( $v );   break;
        case 'result':      $this->validateResult( $v );      break;
        case 'version':     $this->validateVersion( $v );     break;
        case 'attachments': $this->validateAttachments( $v ); break;
      }
      
    }

    $this->validateAuthority( $authority );
    $this->validateId();
    $this->validateStored();

    //now validate a sub statement if one exists
    if( !empty($this->subStatement) ){
      $this->runValidation($this->subStatement);
    }
      
    return array( 'status'    => $this->status, 
                  'errors'    => $this->errors,
                  'statement' => $this->statement );

  }

  /**
   *
   * General validation of the core properties.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#dataconstraints
   *
   * @param array $statement The full statement.
   *
   */
  public function getStarted( $statement ){

    //check statement is set, is an array and not empty
    if( !$this->assertionCheck(
          (isset($statement) && !empty($statement) && is_array($statement)),
          'The statement doesn\'t exist or is not in the correct format.')) return false;

    $data = $this->checkParams( 
      array('id'         => array('uuid', false), 
            'actor'      => array('array', true),
            'verb'       => array('array', true), 
            'object'     => array('array', true), 
            'result'     => array('emptyArray', false), 
            'context'    => array('emptyArray', false),
            'timestamp'  => array('timestamp', false),
            'authority'  => array('emptyArray', false),
            'version'    => array('string', false), 
            'attachments' => array('emptyArray', false)
      ), $statement, 'core statement'
    );

  }

  /**
   * Assertion Checker
   * Checks if an assertion is true
   * Sets a status (default 'failed') and pushed an error on failure/false
   *
   * @param  boolean $assertion    The boolean we are testing
   * @param  string  $fail_error   The string to push into the errors array
   * @param  string  $fail_status  The string to set the status to
   * @return boolean               Whether we the assertion passed the test
   *
   **/
  public function assertionCheck( $assertion, $fail_error='There was an error', $fail_status='failed' ){

    if( !$assertion ){
      $this->setError( $fail_error . ' ', $fail_status );
      return false;
    }

    return true;
  }

  /**
   * Set errors and status
   *
   * Used to set the statement status and any errors.
   * 
   * @param  string  $fail_error   The string to push into the errors array
   * @param  string  $fail_status  The string to set the status to
   *
   **/
  private function setError( $fail_error='There was an error', $fail_status='failed' ){
    $this->status   = $fail_status;
    $this->errors[] = $fail_error;
  }

  /**
  * Validate statement ID.
  * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#stmtid
  *
  * @param UUID $id The statement ID.
  *
  */
  public function validateId(){
    
    //no id? Generate one.
    if( !isset($this->statement['id']) ){
      $id = $this->makeUUID();
      $this->statement['id'] = $id;
    }

    $data = $this->checkParams( 
      array(
        'statementId' => array('uuid', true),
      ), array( 'statementId' => $this->statement['id'] ), 'statementId'
    );

  }

  /**
   * Validate actor. Mandatory.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#actor
   * 
   * @param array $actor
   *
   * @todo check only one functional identifier is passed
   *
   */
  public function validateActor( $actor ){

    $actor_valid = $this->checkParams( 
                                  array(
                                    'mbox'         => array('mailto'),
                                    'name'         => array('string'),
                                    'objectType'   => array('string'),
                                    'mbox_sha1sum' => array('string'),
                                    'openID'       => array('irl'),
                                    'account'      => array('array')
                                  ), $actor, 'actor'
                                );

    if( $actor_valid !== true ) return false; //end here if not true

    //Check that only one functional identifier exists and is permitted
    $identifier_valid = $this->validActorIdentifier( array_keys($actor) );

    if( $identifier_valid != true ) return false; //end here if not true

    //check, if objectType is set, that it is either Group or Agent
    if( isset($actor['objectType']) ){
      if( !$this->assertionCheck( ($actor['objectType'] == 'Agent' || 
                                   $actor['objectType'] == 'Group' ), 
        'The Actor objectType must be Agent or Group.') ) return false;

      if( $actor['objectType'] == 'Group' ){

        //if objectType Group and no functional identifier: unidentified group
        if( $identifier_valid === false ){
          //Unidentified group so it must have an array containing at least one member
          if( !$this->assertionCheck( (isset($actor['member']) && is_array($actor['member'])),
              'As Actor objectType is Group, it must contain a members array.') ) return false;
        }

      }
    }

  }

  /**
   * Validate authority. Mandatory.
   * Overwrite / Add. This assume basic http authentication for now. See @todo
   *
   * @Requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#authority
   * @todo rework to handle 3-legged OAuth.
   *
   * @param array $authority
   *
   */
  public function validateAuthority( $authority ){
    $this->statement['authority'] = array(
      'name'         =>  $authority['name'],
      'mbox'         =>  'mailto:' . $authority['email'],
      'objectType'   =>  'Agent'
    );
  }

  /**
   *
   * Validate verb. Mandatory.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#verb
   *
   * @param array $verb
   * 
   */
  public function validateVerb( $verb ){

    $this->checkParams( 
      array(
        'id'      => array('iri',   true),
        'display' => array('lang_map', false)
      ), $verb, 'verb'
    );

  }

  // 

  /**
   * Validate object. Mandtory.
   *
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#object
   *
   */
  public function validateObject( $object ){

    //find out what type of object it is as that will inform next steps
    if( isset($object['objectType']) ){

      $object_type = $object['objectType'];

      $object_type_valid = $this->checkKeys( array(
                                                'Activity', 
                                                'Group', 
                                                'Agent', 
                                                'SubStatement', 
                                                'StatementRef'
                                              ), array($object_type), 'object'
                                            );

    }else{
      $object_type = 'Activity'; //this is the default if nothing defined.
      $object['objectType'] = $object_type;
    }

    //depending on the objectType, validate accordingly.
    $object_keys = array_keys( $object );

    if( in_array($object_type, array( 'Activity', 'Agent', 'Group', 'StatementRef' )) ){

      if( $object['objectType'] == 'StatementRef' ){
        $array = array('objectType' => array('string'), 
                       'id'         => array('uuid', true), 
                       'definition' => array('emptyArray'));
      }elseif( $object['objectType'] == 'SubStatement' ){
        $array = array('objectType' => array('string'));
      }elseif( $object['objectType'] == 'Agent' ){
        $array = array('objectType' => array('string'), 
                       'name'       => array('string'), 
                       'mbox'       => array('mailto'));
      }else{
        $array = array('objectType' => array('string'), 
                       'id'         => array('iri', true), 
                       'definition' => array('emptyArray'));
      }

      $object_valid = $this->checkParams( $array, $object, 'object' );

      if( $object_valid !== true ) return false; //end here if not true

      if( isset($object['definition']) ){

        $definition = $object['definition'];

        $definition_valid = $this->checkParams( 
                                  array(
                                    'name'          => array('lang_map'), 
                                    'description'   => array('lang_map'), 
                                    'type'          => array('iri'), 
                                    'moreInfo'      => array('irl'), 
                                    'extensions'    => array('array'), 
                                    'interactionType' => array('string'),
                                    'correctResponsesPattern' => array('array'),
                                    'choices'       => array('array'),
                                    'scale'         => array('array'),
                                    'source'        => array('array'),
                                    'target'        => array('array'),
                                    'steps'         => array('array')
                                    ), $definition, 'Object Definition'
                                  );

        if( $definition_valid !== true ) return false; //end here if not true

        if( isset($definition['interactionType']) ){
          //check to see it type is set, if not, set to http://adlnet.gov/expapi/activities/cmi.interaction
          $allowed_interaction_types = array('choice',
                                             'sequencing',
                                             'Likert',
                                             'Matching',
                                             'Performance',
                                             'true-false',
                                             'fill-in',
                                             'numeric',
                                             'other');

          $this->assertionCheck(
            (in_array($definition['interactionType'], $allowed_interaction_types)),
            'Object: definition: interactionType is not valid.');
        }

        if( isset($definition['choices'], $definition['scale'], $definition['source'], $definition['target'],$definition['steps']) ){

          $check_valid_keys = array('id', 'description');
          $loop             = array('choices','scale','source','target','steps');

          foreach( $loop as $l ){

            //check activity object definition only has valid keys.
            $is_valid = $this->checkKeys($check_valid_keys, $definition[$l], 'Object Definition' );

            if( !$this->assertionCheck(($definition_valid === true),
              'Object: definition: It has an invalid property.') ) return false;

            $this->assertionCheck(
              (array_key_exists('id', $definition[$l]) || array_key_exists('description', $definition[$l])),
              'Object: definition: It needs to be an array with keys id and description.');
          }

        }

        $this->assertionCheck(
          (!isset($definition['extensions']) || is_array($definition['extensions'])),
          'Object: definition: extensions need to be an object.');

      }

    }
          
    if( $object_type == 'SubStatement' ){
        
      //remove "id", "stored", "version" or "authority" if exist
      unset($object['id']);
      unset($object['stored']);
      unset($object['version']);
      unset($object['authority']);
      //unset($object['objectType']);

      //check object type is not SubStatement as nesting is not permitted
      if( $object['object']['objectType'] == 'SubStatement' ){
        $this->setError( \Lang::get('xAPIValidation.errors.nesting') );
        return false;
      }

      $this->subStatement = $object;

    }

  }

  /**
   * Validate context. Optional.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#context
   * 
   * @param array $content
   */
  public function validateContext( $context ){

    $valid_context_keys = array('registration'      => array('uuid',   false), 
                                'instructor'        => array('emptyArray',  false), 
                                'team'              => array('emptyArray',  false), 
                                'contextActivities' => array('emptyArray', false), 
                                'revision'          => array('string', false), 
                                'platform'          => array('string', false),
                                'language'          => array('string', false),
                                'statement'         => array('uuid',   false),
                                'extensions'        => array('emptyArray',  false));

    //check all keys submitted are valid
    $this->checkParams($valid_context_keys, $context, 'context');

    //check properties in contextActivies
    if( isset($context['contextActivities']) ){

      $valid_context_keys = array('parent'   => array('emptyArray'), 
                                  'grouping' => array('emptyArray'), 
                                  'category' => array('emptyArray'), 
                                  'other'    => array('emptyArray'));

      //check all keys submitted are valid
      $this->checkParams($valid_context_keys, 
                         $context['contextActivities'],
                         'contextActivities');

      //now check all property keys contain an array
      //While the contextActivity may be an object on input, it must be stored as an array - so 
      //on each type we will check if an associative array has been passed and insert it into an array if needed
      if( isset($context['contextActivities']['parent']) ){
        if( $this->isAssoc( $context['contextActivities']['parent'] ) ){ 
          $this->statement['context']['contextActivities']['parent'] = array( $context['contextActivities']['parent'] );
        }
      }

      if( isset($context['contextActivities']['grouping']) ){
        if( $this->isAssoc( $context['contextActivities']['grouping'] ) ){
          $this->statement['context']['contextActivities']['grouping'] = array( $context['contextActivities']['grouping'] );
        }
      }

      if( isset($context['contextActivities']['category']) ){
        if( $this->isAssoc( $context['contextActivities']['category'] ) ){
            $this->statement['context']['contextActivities']['category'] = array( $context['contextActivities']['category'] );
        }
      }

      if( isset($context['contextActivities']['other']) ){
        if( $this->isAssoc( $context['contextActivities']['other'] ) ){
          $this->statement['context']['contextActivities']['other'] = array( $context['contextActivities']['other'] );
        }
      }
    }

  }

  /**
   *
   * Validate result. Optional.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#result
   *
   * @param array $result
   * 
   */
  public function validateResult( $result ){
    
    $valid_keys   = array('score'       => array('emptyArray',   false), 
                          'success'     => array('boolean', false), 
                          'completion'  => array('boolean', false), 
                          'response'    => array('string',  false),
                          'duration'    => array('iso8601Duration', false), 
                          'extensions'  => array('emptyArray',   false));

    //check all keys submitted are valid
    $this->checkParams($valid_keys, $result, 'result');

    //now check each part of score if it exists
    if( isset($result['score']) ){

      $valid_score_keys = array('scaled' => array('score'), 
                                'raw'    => array('score'), 
                                'min'    => array('score'), 
                                'max'    => array('score'));

      //check all keys submitted are valid
      $this->checkParams($valid_score_keys, $result['score'], 'result score');
      
      //now check format of each score key
      if( isset($result['score']['scaled']) ){
        if( $result['score']['scaled'] > 1 || $result['score']['scaled'] < -1){
          $this->setError(\Lang::get('xAPIValidation.errors.score.scaled'));
        }
      }
      if( isset($result['score']['max']) ){
        if( $result['score']['max'] < $result['score']['min'] ){
          $this->setError(\Lang::get('xAPIValidation.errors.score.max'));
        }
      }
      if( isset($result['score']['min']) ){
        if( isset($result['score']['max'])){
          if( $result['score']['min'] > $result['score']['max'] ){
            $this->setError(\Lang::get('xAPIValidation.errors.score.min'));
          }
        }
      }
      if( isset($result['score']['raw']) ){
        if( isset($result['score']['max']) && isset($result['score']['min']) ){
          if( ($result['score']['raw'] > $result['score']['max']) || ($result['score']['raw'] < $result['score']['min']) ){
            $this->setError(\Lang::get('xAPIValidation.errors.score.raw'));
          }
        }
      }

    }
    
  }

  /**
   * Validate timestamp.
   *
   **/
  public function validateTimestamp(){
    
    //does timestamp exist?
    if( isset($this->statement['timestamp']) ){
      $timestamp = $this->statement['timestamp'];
    }else{
      return false; //no timestamp set
    }

    //check format using http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
    if (!preg_match('/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/', $timestamp) > 0) {
      $this->setError(\Lang::get('xAPIValidation.errors.timestamp'));
      return false;
    } 

    return true;

  }

  /**
   * Validate stored.
   *
   **/
  public function validateStored(){
  
    if( isset( $this->statement['stored'] ) ){
      unset( $this->statement['stored'] );
    }

  }

  /**
   * Validate version.
   **/
  public function validateVersion(){
  
    if( isset( $this->statement['version'] ) ){
      $result = $result = substr($this->statement['version'], 0, 4);
      if( $result != '1.0.' ){
        $this->setError(\Lang::get('xAPIValidation.errors.version'));
        return false;
      }
    }else{
      $this->statement['version'] = '1.0.0';
    }

    return true;

  }

  /**
   * Validate attachments. Optional.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#attachments
   *
   * @param array $attachements
   *
   */
  public function validateAttachments( $attachments ){
  
    $valid_attachment_keys = array('usageType'   => array('iri', true), 
                                   'display'     => array('lang_map', true), 
                                   'description' => array('lang_map', false), 
                                   'contentType' => array('contentType', false), 
                                   'length'      => array('int', true), 
                                   'sha2'        => array('base64', true),
                                   'fileUrl'     => array('iri', false));

    //check all keys are valid
    if( $attachments ){
      foreach( $attachments as $a ){
        $this->checkParams($valid_attachment_keys, $a, 'attachment');
      }
    }

  }

  /**
   * Check to make sure an valid identifier has been included in the statement.
   *
   * @param $actor_keys (array) The array of actor keys to validate
   * @return boolean 
   *
   **/
  public function validActorIdentifier( $actor_keys ){

    $identifier_valid = false;
    $count = 0;
    $functional_identifiers = array('mbox', 'mbox_sha1sum', 'openID', 'account');

    //check functional identifier exists and is valid
    foreach( $actor_keys as $k ){
      if( in_array($k, $functional_identifiers) ){
        $identifier_valid = true;
        $count++; //increment counter so we can check only one identifier is present
      }
    }

    //only allow one identifier
    if( $count > 1 ){
      dd($count);
      $identifier_valid = false;
      $this->setError(\Lang::get('xAPIValidation.errors.actor.one')); 
    }

    if( !$identifier_valid ){
      $this->setError(\Lang::get('xAPIValidation.errors.actor.valid')); 
    }
    
    return $identifier_valid;
  }

  /**
   * Validate submitted keys vs allowed keys. 
   *
   * @param $submitted_keys (array) The array of keys to validate
   * @param $valid_keys     (array) The array of valid keys to check against.
   * @return boolean 
   *
   **/
  public function checkKeys($valid_keys, $submitted_keys, $section=''){
    $valid = true;
    foreach( $submitted_keys as $k ){
      if( !$this->assertionCheck(in_array($k, $valid_keys),
          sprintf( "`%s` is not a permitted key in %s", $k, $section ))) $valid=false;
    }
    return $valid;
  }

  /**
   * Generate unique UUID
   *
   * @return UUID
   *
   **/
  public function makeUUID(){
    return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
      // 32 bits for "time_low"
      mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),

      // 16 bits for "time_mid"
      mt_rand( 0, 0xffff ),

      // 16 bits for "time_hi_and_version",
      // four most significant bits holds version number 4
      mt_rand( 0, 0x0fff ) | 0x4000,

      // 16 bits, 8 bits for "clk_seq_hi_res",
      // 8 bits for "clk_seq_low",
      // two most significant bits holds zero and one for variant DCE1.1
      mt_rand( 0, 0x3fff ) | 0x8000,

      // 48 bits for "node"
      mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
  }

  

  /**
   * Used to validate keys and values
   * @param  array  $requirements  A list of allowed parameters with type, required and allowed values, if applicable.
   *                               format: string, boolean, array
   * @param  array  $data          The data being submitted.
   * @param  string $section       The current section of the statement.
   *
   * @return array
   * 
   */
  public function checkParams( $requirements = array(), $data = array(), $section=''){

    $valid = true;
    
    if( empty($data) ){
      return false;
    }

    //first check to see if the data contains invalid keys
    $check_keys = array_diff_key($data, $requirements);

    //if there are foriegn keys, set required error message
    if( !empty($check_keys) ){
      foreach( $check_keys as $k => $v ){
        $this->setError(\Lang::get('xAPIValidation.errors.actor.one', array(
          'key' => $k,
          'section' => $section
        )), $fail_status='failed', $value='' );
      }
      $valid = false;
    }

    //loop through all permitted keys and check type, required and values
    foreach( $requirements as $key => $value ){

      $data_type      = $value[0];
      $required       = isset($value[1]) ? $value[1] : false;
      $allowed_values = isset($value[2]) ? $value[2] : false;

      //does key exist in data
      if( array_key_exists($key, $data) ){

        //check data value is not null apart from in extensions
        if( $key != 'extensions' ){
          if( !$this->assertionCheck(!is_null($data[$key]),
              sprintf( "`%s` in '%s' contains a NULL value which is not permitted.", $key, $section ))){
            $valid = false;
          }
        }

        $this->checkTypes($key, $data[$key], $data_type, $section );

        //@todo if allowed values set, check value is in allowed values
        if( $allowed_values ){
          //in_array( $value, $allowed_values )
        }

      }else{
        //check to see if the key was required. If yes, set valid to false and set error.
        if( !$this->assertionCheck( !$required,
            sprintf( "`%s` is a required key and is not present in %s", $key, $section ))){
          $valid = false;
        }
      }


    }

    return $valid;

  }

  /**
   * Check types submitted to ensure allowed
   *
   * @param mixed   $data   The data to check
   * @param string    $expected_type The type to check for e.g. array, object,
   * @param string $section The current section being validated. Used in error messages.
   * 
   */
  public function checkTypes($key, $value, $expected_type, $section ){

    switch($expected_type){
      case 'string':
        $this->assertionCheck(is_String($value),
        sprintf( "`%s` is not a valid string in " . $section, $key ));
      break;
      case 'array':
        //used when an array is required 
        $this->assertionCheck((is_array($value) && !empty($value)),
        sprintf( "`%s` is not a valid array in " . $section, $key ));
      break;
      case 'emptyArray':
        //used if value can be empty but if available needs to be an array
        if( $value != '' ){
          $this->assertionCheck(is_array($value),
            sprintf( "`%s` is not a valid array in " . $section, $key ));
        }
      break;
      case 'object':
        $this->assertionCheck(is_object( $value ),
        sprintf( "`%s` is not a valid object in " . $section, $key ));
      break;
      case 'iri':
        $this->assertionCheck($this->validateIRI($value),
        sprintf( "`%s` is not a valid IRI in " . $section, $key ));
      break;
      case 'iso8601Duration':
        $this->assertionCheck($this->validateISO8601($value),
        sprintf( "`%s` is not a valid iso8601 Duration format in " . $section, $key ));
      break;
      case 'timestamp':
        $this->assertionCheck($this->validateTimestamp($value),
        sprintf( "`%s` is not a valid timestamp in " . $section, $key ));
      break;
      case 'uuid':
        $this->assertionCheck($this->validateUUID($value),
        sprintf( "`%s` is not a valid UUID in " . $section, $key ));
      break;
      case 'irl':
        $this->assertionCheck((!filter_var($value, FILTER_VALIDATE_URL)),
        sprintf( "`%s` is not a valid irl in " . $section, $key ));
      break;
      case 'lang_map':
        $this->assertionCheck(
          $this->validateLanguageMap($value),
          \Lang::get('xAPIValidation.errors.langMap', array(
            'key' => $key,
            'section' => $section
          ))
        );
      break;
      case 'base64':
        $this->assertionCheck(
          base64_encode(base64_decode($value)) === $value,
          \Lang::get('xAPIValidation.errors.base64', array(
            'key' => $key,
            'section' => $section
          ))
        );
      break;
      case 'boolean':
        $this->assertionCheck(is_bool($value),
        sprintf( "`%s` is not a valid boolean " . $section, $key ));
      break;
      case 'score':
        $this->assertionCheck(!is_string($value) && (is_int($value) || is_float($value)),
        sprintf( " `%s` needs to be a number in " . $section, $key ));
      break;
      case 'numeric':
        $this->assertionCheck(is_numeric($value),
        sprintf( "`%s` is not numeric in " . $section, $key ));
      break;
      case 'int':
        $this->assertionCheck(is_int($value),
        sprintf( "`%s` is not a valid number in " . $section, $key ));
      break;
      case 'integer':
        $this->assertionCheck(is_integer($value),
        sprintf( "`%s` is not a valid integer in " . $section, $key ));
      break;
      case 'contentType':
        $this->assertionCheck($this->validateInternetMediaType($value),
        sprintf( "`%s` is not a valid Internet Media Type in " . $section, $key ));
      break;
      case 'mailto':
        $mbox_format = substr($value, 0, 7);
        $this->assertionCheck($mbox_format == 'mailto:' && is_string($value),
          sprintf( "`%s` is not in the correct format in " . $section, $key ));
      break;
    }

  }

  /*
  |---------------------------------------------------------------------------------
  | Various validation functions
  |---------------------------------------------------------------------------------
  |
  */

  /**
   *
   * Regex to validate an IRI
   * Regex found here http://stackoverflow.com/questions/161738/what-is-the-best-regular-expression-to-check-if-a-string-is-a-valid-url
   *
   */
  public function validateIRI( $value ){
    if (preg_match('/^[a-z](?:[-a-z0-9\+\.])*:(?:\/\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&\'\(\)\*\+,;=:])*@)?(?:\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4}:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+[-a-z0-9\._~!\$&\'\(\)\*\+,;=:]+)\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}|(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&\'\(\)\*\+,;=@])*)(?::[0-9]*)?(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&\'\(\)\*\+,;=:@]))*)*|\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&\'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&\'\(\)\*\+,;=:@]))*)*)?|(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&\'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&\'\(\)\*\+,;=:@]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&\'\(\)\*\+,;=:@])))(?:\?(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&\'\(\)\*\+,;=:@])|[\x{E000}-\x{F8FF}\x{F0000}-\x{FFFFD}|\x{100000}-\x{10FFFD}\/\?])*)?(?:\#(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&\'\(\)\*\+,;=:@])|[\/\?])*)?$/iu',$value)){
      return true;
    }
    return false;
  }

  /**
   * 
   * Regex to validate Internet media type
   *
   */
  private function validateInternetMediaType( $value ){
    $type = '(application|audio|example|image|message|model|multipart|text|video)';
    $subtype = '(/[-\w\+]+)';
    $attribute = '(;\s*[-\w]+\=[-\w]+)';
    if (is_String($value) && preg_match('#^' . $type . $subtype . $attribute . '*;?$#', $value)) {
      return true;
    }
    return false;
  }

  /**
  * Regex to validate language map.
  * Regex from https://github.com/fugu13/tincanschema/blob/master/tincan.schema.json
  *
  * @param string $item
  * @return boolean
  *
  */
  public function validateLanguageMap( $item ){
    foreach( $item as $k => $v ){
      if( preg_match('/^(([a-zA-Z]{2,8}((-[a-zA-Z]{3}){0,3})(-[a-zA-Z]{4})?((-[a-zA-Z]{2})|(-\d{3}))?(-[a-zA-Z\d]{4,8})*(-[a-zA-Z\d](-[a-zA-Z\d]{1,8})+)*)|x(-[a-zA-Z\d]{1,8})+|en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tsu|i-tay|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)$/iu', $k)){
        return true;
      }
    }

    return false;
  }

  /**
   * Validate if a passed item is a valid UUID
   *
   * @param string $item
   * @return boolean
   */
  public function validateUUID( $item ){
    if( preg_match('/^\{?[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}\}?$/i', $item) ){
      return true;
    }
    return false;
  }

  /**
   * Validate duration conforms to iso8601
   *
   * @param string $item
   * @return boolean
   */
  public function validateISO8601( $item ){
    if( preg_match('/^P((\d+([\.,]\d+)?Y)?(\d+([\.,]\d+)?M)?(\d+([\.,]\d+)?W)?(\d+([\.,]\d+)?D)?)?(T(\d+([\.,]\d+)?H)?(\d+([\.,]\d+)?M)?(\d+([\.,]\d+)?S)?)?$/i', $item) ){
      return true;
    }
    return false;
  }

  /**
   * Returns true if an array is associative 
   * @param  Array  $arr 
   * @return boolean      
   */
  private function isAssoc($arr)
  {
    return array_keys($arr) !== range(0, count($arr) - 1);
  }

}
