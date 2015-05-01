<?php namespace Locker\Helpers;
use \Locker\Helpers\Exceptions as Exceptions;
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
    $return = ['body' => '', 'attachments' => []];
    $sha_hashes = [];
    $boundary = static::getBoundary($content_type);

    // Fetch each part of the multipart document
    $parts = array_slice(explode($boundary, $content), 1);
    $raw_headers = $body = '';

    foreach ($parts as $count => $part) {
      // Stops at the end of the file.
      if ($part == "--") break;

      // Determines the delimiter.
      $delim = strpos($part, "\r\n") !== false ? "\r\n" : "\n";
      $delim = strpos($part, $delim.$delim) === false ? "\n" : $delim;

      // Separate body contents from headers
      $part = ltrim($part, $delim);
      list($raw_headers, $body) = explode($delim.$delim, $part, 2);
      $headers = static::getHeaders($raw_headers, $delim);

      if ($count == 0) {
        if (!isset($headers['content-type']) || $headers['content-type'] !== 'application/json') {
          throw new Exceptions\Exception('Statements must make up the first part of the body.');
        }

        $return['body'] = $body;
      } else {
        static::validateHeaders($headers, $sha_hashes);
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
  private static function getHeaders($raw_headers, $delim) {
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
  private static function getBoundary($content_type) {
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
  private static function validateHeaders(array $headers, array $sha_hashes) {
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
  }

}
