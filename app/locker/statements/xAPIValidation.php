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

  public function getErrors() {
    return $this->errors;
  }

  public function getStatus() {
    return $this->status;
  }

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
        case 'attachments': $this->validateAttachments( $v ); break;
      }

    }

    $this->validateAuthority( $authority );
    $this->validateId();
    $this->validateStored();

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
    if ( !$this->assertionCheck(
      (isset($statement) && !empty($statement) && is_array($statement)),
      \Lang::get('xAPIValidation.errors.incorrect')
    )) return false;

    $data = $this->checkParams(
      array(
        'id'         => array('uuid', false),
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
   * Validate team.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#context
   *
   * @param array $group
   */
  public function validateTeam($team, $groupLimit = null){
    if ($team['objectType'] == 'Group') {
      return $this->validateGroup($team, $groupLimit);
    }
    $this->setError(\Lang::get('xAPIValidation.errors.type', array(
          'key' => $team['objectType'],
          'type' => 'objectType',
          'section' => 'team'
        )));
    return false;
  }

  /**
   * Validate agent.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#actor
   *
   * @param array $agent
   */
  public function validateAgent($agent) {
    // Validate params (returns false if invalid).
    if (!$this->checkParams(array(
        'mbox'         => array('mailto'),
        'name'         => array('string'),
        'objectType'   => array('string'),
        'mbox_sha1sum' => array('string'),
        'openid'       => array('irl'),
        'account'      => array('array')
      ), $agent, 'actor'
    )) return false; // Invalid params.

    // Validates objectType.
    if (isset($agent['objectType']) && !in_array($agent['objectType'], ['Agent', 'Group'])) {
      return false;
    }

    // Validate identifier.
    if (!$this->validActorIdentifier($agent)) return false;

    return true; // Valid agent.
  }

  /**
   * Validate group.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#actor
   *
   * @param array $group
   */
  public function validateGroup($group, $groupLimit = null) {
    $identifiers = $this->countIdentifiers($group);
    $validGroup = $identifiers === 0 ? $this->validateAnonymousGroup($group) : $this->validateIdentifiedGroup($group);

    if ($validGroup && isset($group['member'])) {
      if (!is_null($groupLimit) && count($group['member']) != $groupLimit) {
        $this->setError(\Lang::get('xAPIValidation.errors.group.limit', array(
          'limit' => $groupLimit
        )));
        return false;
      }

      foreach ($group['member'] as $member) {
        if ($member['objectType'] != 'Agent') {
          $this->setError(\Lang::get('xAPIValidation.errors.group.groups'));
          $validGroup = false;
        } else if ($this->validateAgent($member)) {
          $validGroup = false;
        }
      }
    }

    return $validGroup;
  }

  /**
   * Validate agent.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#actor
   *
   * @param array $group
   */
  public function validateIdentifiedGroup($group) {
    // Validate params (returns false if invalid).
    if (!$this->checkParams(array(
        'mbox'         => array('mailto'),
        'name'         => array('string'),
        'objectType'   => array('string', true),
        'mbox_sha1sum' => array('string'),
        'openid'       => array('irl'),
        'member'      => array('array'),
        'account'      => array('array')
      ), $group, 'actor'
    )) return false; // Invalid params.

    return $this->validActorIdentifier($group); // Valid group.
  }

  /**
   * Validate group.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#actor
   *
   * @param array $group
   */
  public function validateAnonymousGroup($group) {
    // Validate params (returns false if invalid).
    if (!$this->checkParams(array(
        'name'         => array('string'),
        'objectType'   => array('string', true),
        'member'      => array('array', true)
      ), $group, 'actor'
    )) return false; // Invalid params.

    return true; // Valid group.
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
  public function validateActor($actor, $groupLimit = null){
    $actor['objectType'] = isset($actor['objectType']) ? $actor['objectType'] : 'Agent';

    switch ($actor['objectType']) {
      case 'Agent': return $this->validateAgent($actor);
      case 'Group': return $this->validateGroup($actor, $groupLimit);
      default:
        $this->setError(\Lang::get('xAPIValidation.errors.type', array(
          'key' => $actor['objectType'],
          'type' => 'objectType',
          'section' => 'actor'
        )));
        return false;
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
    $this->statement['authority'] = $authority;
    return $this->validateActor($authority, 2);
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
    if (isset($object['objectType'])) {

      $object_type = $object['objectType'];

      $object_type_valid = $this->checkKeys([
        'Activity',
        'Group',
        'Agent',
        'SubStatement',
        'StatementRef'
      ], [$object_type], 'object');

    } else {
      $object_type = 'Activity'; //this is the default if nothing defined.
      $object['objectType'] = $object_type;
    }

    //depending on the objectType, validate accordingly.
    $object_keys = array_keys( $object );

    if( in_array($object_type, array( 'Activity', 'Agent', 'Group', 'StatementRef' )) ){

      switch ($object['objectType']) {
        case 'StatementRef':
          $object_valid = $this->validateStatementReference($object);
        break;
        case 'SubStatement':
          $object_valid = $this->checkParams(
            ['objectType' => ['string']],
            $object,
            'object'
          );
        break;
        case 'Agent':
        case 'Group':
          $object_valid = $this->validateActor($object);
        break;
        default: // Activity.
          $object_valid = $this->checkParams([
            'objectType' => ['string'],
            'id' => ['iri', true],
            'definition' => ['emptyArray']
          ], $object, 'object' );
      }

      if( $object_valid !== true ) return false; //end here if not true

      if( isset($object['definition']) ){

        $definition = $object['definition'];

        $definition_valid = $this->checkParams(
                                  array(
                                    'name'          => array('lang_map'),
                                    'description'   => array('lang_map'),
                                    'type'          => array('iri'),
                                    'moreInfo'      => array('irl'),
                                    'extensions'    => array('extension'),
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
                                             'likert',
                                             'matching',
                                             'performance',
                                             'true-false',
                                             'fill-in',
                                             'numeric',
                                             'other');

          $this->assertionCheck(
            (in_array($definition['interactionType'], $allowed_interaction_types)),
            \Lang::get('xAPIValidation.errors.object.interactionType')
          );
        }

        if( isset($definition['choices'], $definition['scale'], $definition['source'], $definition['target'],$definition['steps']) ){

          $check_valid_keys = array('id', 'description');
          $loop             = array('choices','scale','source','target','steps');

          foreach( $loop as $l ){

            //check activity object definition only has valid keys.
            $is_valid = $this->checkKeys($check_valid_keys, $definition[$l], 'Object Definition' );

            if(!$this->assertionCheck(
              ($definition_valid === true),
              \Lang::get('xAPIValidation.errors.object.invalidProperty')
            )) return false;

            $this->assertionCheck(
              (array_key_exists('id', $definition[$l]) || array_key_exists('description', $definition[$l])),
              \Lang::get('xAPIValidation.errors.object.definition')
            );
          }

        }

        $this->assertionCheck(
          (!isset($definition['extensions']) || is_array($definition['extensions'])),
          \Lang::get('xAPIValidation.errors.object.extensions')
        );

      }

    }

    if( $object_type == 'SubStatement' ){
      $this->validateSubStatement($object);
    }
  }


  /**
   * Validate Sub-Statement. Optional.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#sub-statements
   *
   * @param array $statement
   */
  public function validateSubStatement($statement) {
    //check object type is not SubStatement as nesting is not permitted
    if( $statement['object']['objectType'] == 'SubStatement' ){
      $this->setError( \Lang::get('xAPIValidation.errors.nesting') );
      return false;
    }

    $not_allowed = array('id', 'stored', 'version', 'authority');

    foreach($not_allowed as $value) {
      if (isset($statement[$value])) {
        $this->setError( \Lang::get('xAPIValidation.errors.property', array('key' => $value, 'section' => 'SubStatement')) );
        return false;
      }
    }
    foreach( $statement as $k => $v ){
      switch( $k ){
        case 'actor':       $this->validateActor( $v );       break;
        case 'verb':        $this->validateVerb( $v );        break;
        case 'object':      $this->validateObject( $v );      break;
        case 'context':     $this->validateContext( $v );     break;
        case 'timestamp':   $this->validateTimestamp( $v );   break;
        case 'result':      $this->validateResult( $v );      break;
        case 'attachments': $this->validateAttachments( $v ); break;
      }

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
                                'instructor'        => array('array',  false),
                                'team'              => array('array',  false),
                                'contextActivities' => array('emptyArray', false),
                                'revision'          => array('string', false),
                                'platform'          => array('string', false),
                                'language'          => array('lang', false),
                                'statement'         => array('statementRef', false),
                                'extensions'        => array('extension',  false));

    //check all keys submitted are valid
    $this->checkParams($valid_context_keys, $context, 'context');

    if ( isset($context['instructor'])) {
      $this->validateActor($context['instructor']);
    }
    if ( isset($context['team'])) {
      $this->validateTeam($context['team']);
    }
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

      foreach($valid_context_keys as $key => $value) {
        if( isset($context['contextActivities'][$key]) ){
          $this->validateContextActivity($context['contextActivities'][$key], $key);
        }
      }
    }
  }

  /**
   *
   * Validate contextActivities. Optional.
   * @requirements https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#4162-contextactivities-property
   *
   * @param array $contextactivity
   * @param string $key
   */
  public function validateContextActivity($contextactivity, $key) {
    if (is_array($contextactivity)) {
      foreach ($contextactivity as $object) {
        if (!is_array($object)) {
          $this->setError(\Lang::get('validation.array', array('attribute' => $key)));
          return false;
        }
        if (!isset($object['objectType']) || $object['objectType'] == 'Activity') {
          $this->validateObject($object);
          return true;
        }
        $this->setError(\Lang::get('xAPIValidation.errors.type', array(
            'key' => $object['objectType'],
            'type' => 'objectType',
            'section' => 'contextActivities'
        )));
      }
    }
    return false;
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
                          'extensions'  => array('extension',   false));

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

  private function validateISOTimestamp($timestamp) {
    //check format using http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
    if (!preg_match('/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|((?!-0{2}(:0{2})?)([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?)?$/', $timestamp) > 0) {
      $this->setError(\Lang::get('xAPIValidation.errors.timestamp'));
      return false;
    }

    return true;
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

    return $this->validateISOTimestamp($timestamp);
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
                                   'contentType' => array('contentType', true),
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
   * Gets the number of identifiers in $actor.
   * @param  [array] $actor the actor containing the identifiers.
   * @return [integer] the number of identifiers.
   */
  private function countIdentifiers($actor) {
    $actor_keys = array_keys($actor);
    $functional_identifiers = array('mbox', 'mbox_sha1sum', 'openid', 'account');
    $count = 0;

    foreach( $actor_keys as $k ){
      if( in_array($k, $functional_identifiers) ){
        $count += 1;
      }
    }

    return $count;
  }

  /**
   * Checks that a valid account (or no account) exists in $actor.
   * @param  [array] $actor the actor to validate.
   * @return [boolean]
   */
  public function validateAccount($actor) {
    $account_set = isset($actor['account']);
    return !$account_set || (
      $account_set &&
      isset($actor['account']['name']) &&
      isset($actor['account']['homePage']) &&
      $this->checkTypes('name', $actor['account']['name'], 'string', 'account') &&
      $this->checkTypes('homePage', $actor['account']['homePage'], 'irl', 'account')
    );
  }

  /**
   * Check to make sure an valid identifier has been included in the statement.
   *
   * @param $actor (array) The actor to validate
   * @return boolean
   *
   **/
  public function validActorIdentifier($actor){
    $count = $this->countIdentifiers($actor);

    // Must have one identifier.
    if( $count !== 1){
      $this->setError(\Lang::get('xAPIValidation.errors.actor.one'));
      return false;
    }

    // Must have a valid actor.
    else if ($count === 1 && !$this->validateAccount($actor)) {
      $this->setError(\Lang::get('xAPIValidation.errors.account'));
      return false;
    }
    return true;
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
          \Lang::get('xAPIValidation.errors.property', array(
            'key' => $k,
            'section' => $section
          )))) $valid=false;
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
    $remote_addr = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'LL';
    mt_srand(crc32(serialize([microtime(true), $remote_addr, 'ETC'])));

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

    if( empty($data) || !is_array($data) ){
      return false;
    }

    //first check to see if the data contains invalid keys

    $check_keys = array_diff_key($data, $requirements);

    //if there are foriegn keys, set required error message
    if( !empty($check_keys) ){
      foreach( $check_keys as $k => $v ){
        $this->setError(\Lang::get('xAPIValidation.errors.property', array(
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
      $allowed_values = isset($value[2]) ? $value[2] : null;

      //does key exist in data
      if( array_key_exists($key, $data) ){
        if( $key != 'extensions' ){
          if( !$this->assertionCheck(!is_null($data[$key]),
          \Lang::get('xAPIValidation.errors.null', array(
                'key' => $key,
                'section' => $section
              ))
        )) {
            $valid = false;
          }
        }

        $this->checkTypes($key, $data[$key], $data_type, $section );

        // Check value is in allowed values.
        if (!is_null($allowed_values) && !$this->assertionCheck(
          in_array($data[$key], $allowed_values),
          \Lang::get('xAPIValidation.errors.allowed', array(
            'key' => $key,
            'section' => $section,
            'value' => $data[$key]
          ))
        )) {
          $valid = false;
        }

      }else{
        //check to see if the key was required. If yes, set valid to false and set error.
        if( !$this->assertionCheck( !$required,
          \Lang::get('xAPIValidation.errors.required', array(
            'key' => $key,
            'section' => $section
          ))
        )) {
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
      case 'agent':
        return $this->assertionCheck(
          $this->validateAgent($value),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'actorIdentifier'
          ))
        );
      break;
      case 'string':
        return $this->assertionCheck(
          is_String($value),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'string'
          ))
        );
      break;
      case 'array':
        //used when an array is required
        return $this->assertionCheck(
          (is_array($value) && !empty($value)),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'array'
          ))
        );
      break;
      case 'emptyArray':
        //used if value can be empty but if available needs to be an array
        if( $value != '' ){
          return $this->assertionCheck(
            is_array($value),
            \Lang::get('xAPIValidation.errors.type', array(
              'key' => $key,
              'section' => $section,
              'type' => 'array'
            ))
          );
        } else {
          return false;
        }
      break;
      case 'object':
        return $this->assertionCheck(
          is_object( $value ),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'object'
          ))
        );
      break;
      case 'iri':
        return $this->assertionCheck(
          $this->validateIRI($value),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'IRI'
          ))
        );
      break;
      case 'iso8601Duration':
        return $this->assertionCheck(
          $this->validateISO8601($value),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'iso8601 Duration format'
          ))
        );
      break;
      case 'timestamp':
        return $this->assertionCheck(
          $this->validateTimestamp($value),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'timestamp'
          ))
        );
      break;
      case 'isoTimestamp':
        return $this->assertionCheck(
        $this->validateISOTimestamp($value),
        \Lang::get('xAPIValidation.errors.type', array(
          'key' => $key,
          'section' => $section,
          'type' => 'ISO 8601 timestamp'
          ))
        );
      break;
      case 'uuid':
        return $this->assertionCheck(
          $this->validateUUID($value),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'UUID'
          ))
        );
      break;
      case 'irl':
        return $this->assertionCheck(
          filter_var($value, FILTER_VALIDATE_URL),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'irl'
          ))
        );
      break;
      case 'lang_map':
        return $this->assertionCheck(
          $this->validateLanguageMap($value),
          \Lang::get('xAPIValidation.errors.langMap', array(
            'key' => $key,
            'section' => $section
          ))
        );
      break;
      case 'lang':
        return $this->assertionCheck(
          $this->validateLanguageCode($value),
          \Lang::get('xAPIValidation.errors.lang', array(
          'key' => $key,
          'section' => $section
          ))
        );
      break;
      case 'base64':
        return $this->assertionCheck(
          base64_encode(base64_decode($value)) === $value,
          \Lang::get('xAPIValidation.errors.base64', array(
            'key' => $key,
            'section' => $section
          ))
        );
      break;
      case 'boolean':
        return $this->assertionCheck(
          is_bool($value),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'boolean'
          ))
        );
      break;
      case 'score':
        return $this->assertionCheck(
          !is_string($value) && (is_int($value) || is_float($value)),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'number'
          ))
        );
      break;
      case 'numeric':
        return $this->assertionCheck(
          is_numeric($value),
          \Lang::get('xAPIValidation.errors.numeric', array(
            'key' => $key,
            'section' => $section
          ))
        );
      break;
      case 'int':
        return $this->assertionCheck(
          is_int($value),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'number'
          ))
        );
      break;
      case 'integer':
        return $this->assertionCheck(
          is_integer($value),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'integer'
          ))
        );
      break;
      case 'contentType':
        return $this->assertionCheck(
          $this->validateInternetMediaType($value),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'Internet Media Type'
          ))
        );
      break;
      case 'mailto':
        $mbox_format = substr($value, 0, 7);
        return $this->assertionCheck(
          $mbox_format == 'mailto:' && is_string($value),
          \Lang::get('xAPIValidation.errors.format', array(
            'key' => $key,
            'section' => $section
          ))
        );
      break;
      case 'statementRef':
        return $this->assertionCheck(
          $this->validateStatementReference($value),
          \Lang::get('xAPIValidation.errors.type', array(
            'key' => $key,
            'section' => $section,
            'type' => 'Statement Reference'
          ))
        );
      break;
      case 'extension':
        if( $value != '' ){
          return $this->assertionCheck(
            $this->validateExtensions($value),
            \Lang::get('xAPIValidation.errors.type', array(
              'key' => $key,
              'section' => $section,
              'type' => 'array'
            ))
          );
        } else {
          return false;
        }
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
   * Validate extensions
   *
   * @param array $item
   * @return boolean
   *
   */
  public function validateExtensions( $item ) {
    if (is_array($item)) {
      foreach( $item as $k => $v ){
        if( !$this->validateIRI( $k ) ){
          return false;
        }
      }
      return true;
    }
    return false;
  }
  /**
  * Validate language map.
  *
  * @param array $item
  * @return boolean
  *
  */
  public function validateLanguageMap( $item ){
    foreach( $item as $k => $v ){
      if( !$this->validateLanguageCode( $k ) ){
        return false;
      }
    }
    return true;
  }

  /**
   * Regex to validate RFC 5646 language code
   * Regex from https://github.com/fugu13/tincanschema/blob/master/tincan.schema.json
   *
   * @param string $item
   * @return boolean
   *
   */
  public function validateLanguageCode( $item ) {
    if (preg_match('/^(([a-zA-Z]{2,8}((-[a-zA-Z]{3}){0,3})(-[a-zA-Z]{4})?((-[a-zA-Z]{2})|(-\d{3}))?(-[a-zA-Z\d]{4,8})*(-[a-zA-Z\d](-[a-zA-Z\d]{1,8})+)*)|x(-[a-zA-Z\d]{1,8})+|en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tsu|i-tay|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)$/iu', $item)){
      return true;
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
   * Validate Statement Reference
   *
   * @param Array $item
   * @return boolean
   */
  public function validateStatementReference( $item ){
    // Validate params (returns false if invalid).
    if (!$this->checkParams([
        'id'         => ['uuid', true],
        'objectType'   => ['string', true, ['StatementRef']]
      ], $item, 'statement reference'
    )) return false; // Invalid params.

    return true;
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
