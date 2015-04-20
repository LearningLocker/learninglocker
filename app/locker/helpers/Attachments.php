<?php namespace Locker\Helpers;

use \Locker\Repository\Document\FileTypes as FileTypes;

class Attachments {

  /**
   * Get statements and attachments from submitted content
   *
   * @param $content_type
   * @param $content
   *
   * @return array
   *
   **/
  static function setAttachments($content_type, $content) {
    $return = [];
    $sha_hashes = [];
    $boundary = $this->getBoundary($content_type);

    // Fetch each part of the multipart document
    $parts = array_slice(explode($boundary, $content), 1);
    $raw_headers = $body = '';

    foreach ($parts as $count => $part) {
      // Stops at the end of the file.
      if ($part == "--") break;

      // Determines the delimiter.
      $delim = strpos($part, "\r\n") ? "\r\n" : "\n";

      // Separate body contents from headers
      $part = ltrim($part, $delim);
      list($raw_headers, $body) = explode($delim.$delim, $part, 2);
      $headers = $this->getHeaders($raw_headers, $delim);

      if ($count == 0) {
        if ($headers['content-type'] !== 'application/json') {
          throw new Exceptions\Exception('Statements must make up the first part of the body.');
        }

        // Gets hash from each statement.
        $statements = json_decode($body);
        $statements = is_array($statements) ? $statements : [$statements];
        foreach ($statements as $statement){
          foreach($statement->attachments as $attachment){
            $sha_hashes[] = $attachment->sha2;
          }
        }

        $return['body'] = $body;
      } else {
        $this->validateHeaders($headers);
        $return['attachments'][$count] = (object) [
          'hash' => $headers['x-experience-api-hash'],
          'content_type' => $headers['content-type'],
          'content' => $body
        ];
      }
    }

    return $return;
  }

  /**
   * Gets the boundary from the content type.
   * @param String $raw_headers
   * @param String $delim
   * @return [String => Mixed]
   */
  private function getHeaders($raw_headers, $delim) {
    $raw_headers = explode($delim, $raw_headers);
    $headers = [];
    foreach ($raw_headers as $header) {
      list($name, $value) = explode(':', $header);
      $headers[strtolower($name)] = ltrim($value, ' ');
    }
    return $headers;
  }

  /**
   * Gets the boundary from the content type.
   * @param String $content_type
   * @return String
   */
  private function getBoundary($content_type) {
    preg_match('/boundary=(.*)$/', $content_type, $matches);
    if (!isset($matches[1])) throw new Exceptions\Exception(
      'You need to set a boundary if submitting attachments.'
    );
    return '--'.$matches[1];
  }

  /**
   * Validates the attachment headers.
   * @param [String => Mixed] $headers
   */
  private function validateHeaders(array $headers) {
    if (!isset($headers['content-type'])) {
      throw new Exceptions\Exception('You need to set a content type for your attachments.');
    }

    //get the correct ext if valid
    $ext = array_search($headers['content-type'], FileTypes::getMap());
    if ($ext === false) {
      throw new Exceptions\Exception('This file type cannot be supported');
    }

    //check X-Experience-API-Hash is set, otherwise reject @todo
    if (!isset($headers['x-experience-api-hash']) || $headers['x-experience-api-hash'] == '') {
      throw new Exceptions\Exception('Attachments require an api hash.');
    }

    //check x-experience-api-hash is contained within a statement
    if (!in_array($headers['x-experience-api-hash'], $sha_hashes)) {
      throw new Exceptions\Exception(
        'Attachments need to contain x-experience-api-hash that is declared in statement.'
      );
    }
  }

}
