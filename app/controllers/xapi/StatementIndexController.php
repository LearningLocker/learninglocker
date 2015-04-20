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
   * @param String $lrs_id
   * @return Response
   */
  public function index($lrs_id) {
    // Gets an index of the statements with the given options.
    list($statements, $count, $opts) = $this->statements->index(array_merge([
      'lrs_id' => $lrs_id,
      'langs' => LockerRequest::header('Accept-Language', [])
    ], LockerRequest::all()));

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
      'more' => $this->getMoreLink($count, $options['limit'], $options['offset']),
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
    $content_type = 'multipart/mixed; boundary='.static::BOUNDARY;
    $statement_result = "Content-Type:application/json{static::EOL}{static::EOL}".$this->makeStatementsResult(
      $statements,
      $count,
      $opts
    );
    $body = "--{static::BOUNDARY}{static::EOL}".implode(
      "{static::EOL}--{static::BOUNDARY}{static::EOL}",
      array_merge([$statement_result], array_map(function ($attachment) {
        return (
          'Content-Type:'.$attachment->content_type.static::EOL.
          'Content-Transfer-Encoding:binary'.static::EOL.
          'X-Experience-API-Hash:'.$attachment->hash.
          static::EOL.static::EOL.
          $attachment->content
        );
      }, $this->statements->getAttachments($statements, $opts)))
    )."{static::EOL}--{static::BOUNDARY}--";
  }

  private function getMoreLink($count, $limit, $offset) {
    // Calculates the $next_offset.
    $next_offset = $offset + $limit;
    if ($total <= $next_offset) return '';

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
