<?php namespace Tests\Routes;
use \Tests\StatementsTestCase as StatementsTestCase;
use \Locker\Helpers\Helpers as Helpers;

class StatementAttachmentTest extends StatementsTestCase {
  use RouteTestTrait;
  protected $boundary = 'abcABC0123\'()+_,-./:=?';

  public function setup() {
    parent::setup();
    $this->statements[0]->delete();
  }

  protected function requestStatements($method, $params = [], $server = [], $content = '') {
    $uri = '/data/xAPI/statements';
    $server = array_merge($this->getServer($this->ll_client), $server);
    return $this->request($method, $uri, $params, $server, $content);
  }

  private function generateStatementWithAttachment($attachment) {
    $attachment = $attachment;
    unset($attachment['content']);
    return $this->generateStatement([
      'attachments' => [$attachment]
    ]);
  }

  private function getAttachment($attachment_location) {
    $attachment_content = file_get_contents($attachment_location);
    return [
      'content' => $attachment_content,
      'contentType' => mime_content_type($attachment_location),
      'usageType' => 'http://id.tincanapi.com/attachment/certificate-of-completion',
      'length' => filesize($attachment_location),
      'sha2' => hash('sha256', $attachment_content),
      'display' => [
        'en-GB' => basename($attachment_location)
      ]
    ];
  }

  private function generateContent($encoded_statement, $attachment) {
    return (
      "--$this->boundary".PHP_EOL.
      'Content-Type:application/json'.PHP_EOL.PHP_EOL.
      $encoded_statement.PHP_EOL.
      "--$this->boundary".PHP_EOL.
      'Content-Type:'.$attachment['contentType'].PHP_EOL.
      'Content-Transfer-Encoding:binary'.PHP_EOL.
      'X-Experience-API-Hash:'.$attachment['sha2'].PHP_EOL.PHP_EOL.
      $attachment['content'].PHP_EOL.
      "--$this->boundary--"
    );
  }

  private function storeAttachments() {
    $attachment_location = __DIR__ . '/../fixtures/attachment.jpg';
    $attachment = $this->getAttachment($attachment_location);
    $statement = $this->generateStatementWithAttachment($attachment);
    $request_content = $this->generateContent(json_encode($statement), $attachment);

    // Sends request.
    $response = $this->requestStatements('POST', [], [
      'CONTENT_TYPE' => "multipart/mixed; boundary=$this->boundary"
    ], $request_content);

    // Checks that the response is correct.
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertEquals(true, method_exists($response, 'getContent'));

    // Checks that the content is correct.
    $content = json_decode($response->getContent());
    $this->assertEquals(true, is_array($content));
    $this->assertEquals(true, isset($content[0]));
    $this->assertEquals(true, is_string($content[0]));
    $this->assertEquals($this->statement_id, $content[0]);

    return $attachment;
  }

  public function testIndexAttachments() {
    $attachment = $this->storeAttachments();
    $statement = (new \Statement)
      ->where('lrs._id', $this->lrs->_id)
      ->where('statement.id', $this->statement_id)
      ->first()->statement;

    $response = $this->requestStatements('GET', [
      'attachments' => true
    ]);

    // Adds a new line to the attachment content because it is returned like this.
    $attachment['content'] .= PHP_EOL;
    
    // Checks that the content is correct.
    $actual_content = str_replace("\r", "", $response->getContent());
    $expected_content = str_replace("\r", "", $this->generateContent(json_encode([
      'more' => '',
      'statements' => [$statement]
    ]), $attachment));

    // Hashes the content, otherwise it destroys the terminal if the assertion fails.
    $actual_hash = hash('sha256', $actual_content);
    $expected_hash = hash('sha256', $expected_content);
    $this->assertEquals($actual_hash, $expected_hash);
  }

  private function deleteDirectory($dir) {
    array_map(function ($file) {
      if (is_dir($file)) {
        $this->deleteDirectory($file);
      } else {
        unlink($file);
      }
    }, glob($dir . '*', GLOB_MARK));
    if (is_dir($dir)) {
      rmdir($dir);
    }
  }

  public function tearDown() {
    parent::tearDown();
    $dir = Helpers::getEnvVar('LOCAL_FILESTORE').'/'.$this->lrs->_id;
    $this->deleteDirectory($dir);
    (new \Statement)
      ->where('lrs._id', $this->lrs->_id)
      ->delete();
  }
}
