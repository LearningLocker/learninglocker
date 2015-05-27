<?php namespace Controllers\xAPI;

use \Locker\Repository\Statement\Repository as StatementRepo;
use \Locker\Helpers\Exceptions as Exceptions;
use \Locker\Helpers\Helpers as Helpers;
use \LockerRequest as LockerRequest;

class StatementIndexController {

  const BOUNDARY = 'abcABC0123\'()+_,-./:=?';
  const EOL = "\r\n";

  /**
   * Constructs a new StatementIndexController.
   * @param StatementRepo $statement_repo
   */
  public function __construct(StatementRepo $statement_repo) {
    $this->statements = $statement_repo;
  }

  /**
   * Gets an array of statements.
   * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#723-getstatements
   * @param [String => mixed] $options
   * @return Response
   */
  public function index($options) {
    // Gets the acceptable languages.
    $langs = LockerRequest::header('Accept-Language', []);
    $langs = is_array($langs) ? $langs : explode(',', $langs);
    $langs = array_map(function ($lang) {
      return explode(';', $lang)[0];
    }, $langs);

    // Gets the params.
    $params = LockerRequest::all();
    if (isset($params['agent'])) {
      $decoded_agent = json_decode($params['agent']);
      if ($decoded_agent !== null) {
        $params['agent'] = $decoded_agent;
      }
    }

    // Gets an index of the statements with the given options.
    list($statements, $count, $opts) = $this->statements->index(array_merge([
      'langs' => $langs
    ], $params, $options));

    // Defines the content type and body of the response.
    if ($opts['attachments'] === true) {
      $content_type = 'multipart/mixed; boundary='.static::BOUNDARY;
      $body = $this->makeAttachmentsResult($statements, $count, $opts);
    } else {
      $content_type = 'application/json;';
      $body = $this->makeStatementsResult($statements, $count, $opts);
    }

    // Creates the response.
    return \Response::make($body, 200, [
      'Content-Type' => $content_type,
      'X-Experience-API-Consistent-Through' => Helpers::getCurrentDate()
    ]);;
  }

  /**
   * Makes a statements result.
   * @param [\stdClass] $statements
   * @param Int $count
   * @param [String => Mixed] $opts
   * @return \stdClass
   */
  private function makeStatementsResult(array $statements, $count, array $opts) {
    // Defaults to empty array of statements.
    $statements = $statements ?: [];

    // Replaces '&46;' in keys with '.' in statements.
    // http://docs.learninglocker.net/docs/installation#quirks
    $statements = Helpers::replaceHtmlEntity($statements);

    // Creates the statement result.
    $statement_result = (object) [
      'more' => $this->getMoreLink($count, $opts['limit'], $opts['offset']),
      'statements' => $statements
    ];

    return json_encode($statement_result);
  }

  /**
   * Makes an attachments result.
   * @param [\stdClass] $statements
   * @param [String => Mixed] $opts
   * @return \stdClass
   */
  private function makeAttachmentsResult(array $statements, $count, array $opts) {
    $boundary = static::BOUNDARY;
    $eol = static::EOL;
    $content_type = 'multipart/mixed; boundary='.$boundary;
    $statement_result = "Content-Type:application/json$eol$eol".$this->makeStatementsResult(
      $statements,
      $count,
      $opts
    );

    return "--$boundary$eol".implode(
      "$eol--$boundary$eol",
      array_merge([$statement_result], array_map(function ($attachment) use ($eol, $boundary) {
        return (
          'Content-Type:'.$attachment->content_type.$eol.
          'Content-Transfer-Encoding:binary'.$eol.
          'X-Experience-API-Hash:'.$attachment->hash.
          $eol.$eol.
          $attachment->content
        );
      }, $this->statements->getAttachments($statements, $opts)))
    )."$eol--$boundary--";
  }

  private function getMoreLink($count, $limit, $offset) {
    // Calculates the $next_offset.
    $next_offset = $offset + $limit;
    if ($count <= $next_offset) return '';

    // Changes (when defined) or appends (when undefined) offset.
    $query = \Request::getQueryString();
    $statement_route = \URL::route('xapi.statement', [], false);
    $current_url = $query ? $statement_route.'?'.$query : $statement_route;

    if (strpos($query, "offset=$offset") !== false) {
      return str_replace(
        'offset=' . $offset,
        'offset=' . $next_offset,
        $current_url
      );
    } else {
      $separator = strpos($current_url, '?') !== False ? '&' : '?';
      return $current_url . $separator . 'offset=' . $next_offset;
    }
  }
}
