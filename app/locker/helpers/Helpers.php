<?php namespace Locker\Helpers;

use \Locker\XApi\Atom as XAPIAtom;
use \Locker\XApi\Errors\Error as XAPIError;


/**
 * Some handy static function for isolated tasks.
 *
 * @todo change these from static methods
 *
 **/

class Helpers {

  /*
  |----------------------------------------------------------------------------
  | scan array and replace &46; with . (This is a result of . being
  | reserved in Mongo) convert array to json as this is faster for
  | multi-dimensional arrays (?) @todo check this out.
  |----------------------------------------------------------------------------
  */
  static function replaceHtmlEntity( $array, $toArray = false ){

    return json_decode(str_replace('&46;','.', json_encode($array)), $toArray);

  }

  /*
  |---------------------------------------------------------------------------
  | Mongo doesn't allow full stops in keys, so replace with html entity &46;
  |---------------------------------------------------------------------------
  */
  static function replaceFullStopInKeys( $string ){

    return str_replace('.', '&46;', $string);

  }

  /*
  |---------------------------------------------------------------------------
  | Loop through a statement and check keys for full stops, if exist, replace.
  |---------------------------------------------------------------------------
  */
  static function replaceFullStop( $array ){

    $output = [];

    if( !empty($array) ){

      foreach($array as $key => $value){
        if(is_array($value)){
          $new = Helpers::replaceFullStopInKeys( $key );
          $output[$new] = Helpers::replaceFullStop( $value );
        }else{

          $new = Helpers::replaceFullStopInKeys( $key );
          $output[$new] = $value;

        }

      }

    }

    return $output;


  }

  /*
  |---------------------------------------------------------------------------
  | Loop through a statement and check for NULL values.
  |---------------------------------------------------------------------------
  */
  static function checkForNull( $array ){

    foreach ( $array as $key => $value ){
      if( is_array( $value ) ){
        Helpers::checkForNull( $value );
      }else{
        if( !is_null($value) ){
          //if the key is not extensions, then reject statement
          //do something
        }
      }
    }

  }

  /*
  |----------------------------------------------------------------------------
  | Generate a random key
  |----------------------------------------------------------------------------
  */
  static function getRandomValue(){
    return sha1(uniqid(mt_rand(), true));
  }

  /*
  |---------------------------------------------------------------------------
  | Get gravatar
  |---------------------------------------------------------------------------
  */

  static function getGravatar( $email, $size = '50' ){
    return "https://www.gravatar.com/avatar/" . md5( strtolower( trim( $email ) ) ) . "?s=" . $size;
  }

  /**
   * Gets the environment by matching a given host to a config.
   * @param  AssocArray $config Configuration mapping an environment => hosts
   * @param  String $givenHost A string representing the host.
   * @return String Matched environment from the config.
   */
  static function getEnvironment($config, $givenHost) {
    foreach ($config as $environment => $hosts) {
      foreach ($hosts as $host) {
        if (str_is($host, $givenHost)) return $environment;
      }
    }
  }

  static function getEnvVar($var) {
    $value = getenv($var);
    if ($value === false) {
      $defaults = include base_path() . '/.env.php';
      $value = $defaults[$var];
    }
    
    return $value;
  }
  
  /**
   * Determines which identifier is currently in use in the given actor.
   * @param \stdClass $actor.
   * @return String|null Identifier in use.
   */
  static function getAgentIdentifier(\stdClass $actor) {
    if (isset($actor->mbox)) return 'mbox';
    if (isset($actor->account)) return 'account';
    if (isset($actor->openid)) return 'openid';
    if (isset($actor->mbox_sha1sum)) return 'mbox_sha1sum';
    return null;
  }

  /**
   * Validates a XAPIAtom.
   * @param XAPIAtom $atom Atom to be validated.
   * @param String $trace Where the atom has came from (i.e. request parameter name).
   */
  static function validateAtom(XAPIAtom $atom, $trace = null) {
    $errors = $atom->validate();
    if (count($errors) > 0) {
      throw new Exceptions\Validation(array_map(function (XAPIError $error) use ($trace) {
        return (string) ($trace === null ? $error : $error->addTrace($trace));
      }, $errors)));
    }
  }
}
