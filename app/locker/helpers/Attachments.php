<?php namespace app\locker\helpers;


class Attachments {

  /**
   * Get statements and attachments from submitted content
   *
   * @param $content_type
   * @param $incoming_statement
   *
   * @return array
   *
   **/
  static function setAttachments( $content_type, $incoming_statement ){

    $return     = array();
    $sha_hashes = array();

    //grab boundary from content_type header - @todo not sure which way is better?
    preg_match('/boundary=(.*)$/', $content_type, $matches);
    //if no boundary, abort
    if( !isset($matches[1]) ){
      \App::abort(400, 'You need to set a boundary if submitting attachments.');
    }
    $boundary = '--' . $matches[1];

    // Fetch each part of the multipart document
    $parts = array_slice(explode($boundary, $incoming_statement), 1);
    $data = array();
    $raw_headers = $body = '';

    //loop through all parts on the body
    foreach ($parts as $count => $part) {
      // At the end of the file, break
      if ($part == "--") break;

      // Determines the delimiter.
      $delim = "\n";
      if (strpos($part, "\r".$delim) !== false) $delim = "\r".$delim;

      // Separate body contents from headers
      $part = ltrim($part, $delim);
      list($raw_headers, $body) = explode($delim.$delim, $part, 2);

      // Parse headers and separate so we can access
      $raw_headers = explode($delim, $raw_headers);
      $headers     = array();
      foreach ($raw_headers as $header) {
        list($name, $value) = explode(':', $header);
        $headers[strtolower($name)] = ltrim($value, ' ');
      }

      //the first part must be statements
      if( $count == 0 ){
        //this is part one, which must be statements
        if( $headers['content-type'] !== 'application/json' ){
          \App::abort(400, 'Statements must make up the first part of the body.');
        }

        //get sha2 hash from each statement
        $set_body = json_decode($body, true);
        if( is_array(json_decode($body)) ){
          foreach($set_body as $a){
            foreach($a['attachments'] as $attach){
              $sha_hashes[] = $attach['sha2'];
            }
          }
        }else{
          foreach($set_body['attachments'] as $attach){
            $sha_hashes[] = $attach['sha2'];
          }
        }

        //set body which will = statements
        $return['body'] = $body;

      }else{

        //get the attachment type (Should this be required? @todo)
        if( !isset($headers['content-type']) ){
          \App::abort(400, 'You need to set a content type for your attachments.');
        }

        //get the correct ext if valid
        $fileTypes = new \Locker\Repository\Document\FileTypes;
        $ext = array_search( $headers['content-type'], $fileTypes::getMap() );
        if( $ext === false ){
          \App::abort(400, 'This file type cannot be supported');
        }

        //if content-transfer-encoding is not binary, reject attachment @todo
        // if( !isset($headers['content-transfer-encoding']) || $headers['content-transfer-encoding'] !== 'binary' ){
        //   \App::abort(400, 'This is the wrong encoding type');
        // }

        //check X-Experience-API-Hash is set, otherwise reject @todo
        if( !isset($headers['x-experience-api-hash']) || $headers['x-experience-api-hash'] == ''){
          \App::abort(400, 'Attachments require an api hash.');
        }

        //check x-experience-api-hash is contained within a statement
        if( !in_array($headers['x-experience-api-hash'], $sha_hashes)){
          \App::abort(400, 'Attachments need to contain x-experience-api-hash that is declared in statement.');
        }

        $return['attachments'][$count] = $part;

      }

    }

    return $return;

  }

}
