<?php namespace Controllers\xAPI;

use \Locker\Repository\Statement\Repository as StatementRepo;
use \Locker\Helpers\Exceptions as Exceptions;
use \Locker\Helpers\Helpers as Helpers;
use \LockerRequest as LockerRequest;

class StatementIndexController {

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
      $content_type = Helpers::mixedMultipartContentType();
      $body = function () use ($statements, $count, $opts) {
        return $this->makeAttachmentsResult($statements, $count, $opts);
      };
    } else {
      $content_type = 'application/json;';
      $body = function () use ($statements, $count, $opts) {
        return $this->makeStatementsResult($statements, $count, $opts);
      };
    }

    // Creates the response.
    return \Response::stream($body, 200, [
      'Content-Type' => $content_type,
      'X-Experience-API-Consistent-Through' => Helpers::getCurrentDate()
    ]);
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

    $this->emit(json_encode($statement_result));
  }

  /**
   * Makes an attachments result.
   * @param [\stdClass] $statements
   * @param [String => Mixed] $opts
   * @return \stdClass
   */
  private function makeAttachmentsResult(array $statements, $count, array $opts) {
    $boundary = Helpers::MULTIPART_BOUNDARY;
    $eol = static::EOL;
    
    $this->emit("--$boundary$eol");
    $this->emit("Content-Type:application/json$eol$eol");
    $this->makeStatementsResult(
      $statements,
      $count,
      $opts
    );

    $attachments = $this->statements->getAttachments($statements, $opts);
    foreach ($attachments as $attachment) {
        $this->emit(
          "$eol--$boundary$eol".
          'Content-Type:'.$attachment->content_type.$eol.
          'Content-Transfer-Encoding:binary'.$eol.
          'X-Experience-API-Hash:'.$attachment->hash.
          $eol.$eol
        );
        while (!feof($attachment->content)) {
          $this->emit(fread($attachment->content, 8192));
        }
        fclose($attachment->content);
    }

    $this->emit("$eol--$boundary--");
  }

  private function emit($value) {
    if (ob_get_level() == 0) ob_start();
    echo $value;
    flush();
    ob_flush();
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
