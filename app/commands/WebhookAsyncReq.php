<?php

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class WebhookAsyncReq extends Command {

  /**
   * The console command name.
   *
   * @var string
   */
  protected $name = 'webhook-async-req';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Send webhook asynchronous request';

  /**
   * Create a new command instance.
   *
   * @return void
   */
  public function __construct() {
    parent::__construct();
  }

  /**
   * Execute the console command.
   *
   * @return mixed
   */
  public function fire($job, $data) {
    $jobId = $job->getJobId();
    Webhook::where('lrs_id', $data['lrs'])->chunk(10, function ($webhooks) use ($jobId, $data) {
      foreach ($webhooks as $webhook) {
        if (array_get($data, 'statement.verb.id') === $webhook->verb) {
          $tokens = $this->fillTokens($webhook->tokens, $data);
          $payload = $this->replaceTokens($webhook->req_payload, $tokens);
          $this->forkCurl($webhook->req_type, $webhook->req_url, $webhook->req_headers, $payload, $jobId);
        }
      }
    });
    $job->delete();
  }

  /**
   * Get the console command arguments.
   *
   * @return array
   */
  protected function getArguments() {
    return [];
  }

  /**
   * Get the console command options.
   *
   * @return array
   */
  protected function getOptions() {
    return [];
  }

  /**
   * Fork curl process
   */
  protected function forkCurl($reqType, $url, $reqHeaders, $payload, $jobId) {
    $cmd[] = "curl";
    $cmd[] = "-X " . $reqType;
    $headers = preg_split("/\r\n|\n|\r/", $reqHeaders);
    if (!empty($headers)) {
      array_walk($headers, function(&$item) {
        $item = "-H '" . $item . "'";
      });
      $cmd += $headers;
    }
    if (!empty($payload)) {
      $cmd[] = "-d " . escapeshellarg($payload);
    }
    $cmd[] = "'" . $url . "'";
    if (Config::get('app.debug', FALSE) === FALSE) {
      $cmd[] = "> /dev/null 2>&1 &";
    }
    exec(implode(" ", $cmd), $output, $exit);
    if ($exit != 0) {
      throw new Exception("Unable to fork curl process with job " . $jobId);
    }
  }

  /**
   * 
   */
  protected function fillTokens($assignStr, $array) {
    $tokens = parse_ini_string($assignStr);
    if ($tokens === FALSE)
      return [];
    array_walk($tokens, function(&$token) use ($array) {
      $token = array_get($array, $token);
    });
    return $tokens;
  }

  /**
   *
   */
  protected function replaceTokens($str, $tokens = []) {
    $keys = array_keys($tokens);
    array_walk($keys, function(&$key) {
      $key = '@' . $key;
    });
    return str_replace($keys, array_values($tokens), $str);
  }

}
