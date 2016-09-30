<?php namespace app\locker\listeners;

use \Config as Config;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class MessageQueueHandler {
  protected $isEnabled = false;
  protected $connection = false;
  protected $exchange;

  public function __construct() {  
    // If not enabled, we have nothing more to do
    if ($this::enabled() != true) {
      return;
    }  
  
    $options = Config::get('rabbitmq');
    $this->exchange = $options['exchange'];

    // Setup the connection, TODO SSL
    $this->connection = new AMQPStreamConnection($options['host'], $options['port'],
      $options['username'], $options['password']);	

    // If we setup a connection, make sure to shut it down
    register_shutdown_function(array($this, 'shutdown'));
  }

  public function is_enabled() {
    return $this->isEnabled;
  } 

  public function statement_store($statements) {
    error_log('blah');
    if ($this->connection == false) {
       return false;
    }

    // Publish to topic exchange
    $key = 'statements';
    $data = json_encode($statements);
    $msg = new AMQPMessage($data);
    $channel = $this->connection->channel();
    $channel->basic_publish($msg, $this->exchange,  $key);
    $channel->close();
  }

  public function shutdown() {
    // Close the connection on shutdown
    $this->connection->close();
  }

  public static function enabled() {
    // Determin if enabled
    return Config::get('rabbitmq.enabled');
  } 
}