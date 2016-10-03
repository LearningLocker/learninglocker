<?php namespace app\locker\listeners;

use \Config as Config;
use PhpAmqpLib\Connection\AMQPSSLConnection;
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

    $sslEnabled = Config::get('rabbitmq.ssl_enabled');
    if ($sslEnabled) {
      $sslOptions = Config::get('rabbitmq.ssl');
      $this->connection = new AMQPSSLConnection($options['host'], $options['port'],
        $options['username'], $options['password'], $options['vhost'], $sslOptions);
    } else {  
      $this->connection = new AMQPStreamConnection($options['host'], $options['port'],
        $options['username'], $options['password'], $options['vhost']);
    }

    // If we setup a connection, make sure to close it during shutdown
    register_shutdown_function(array($this, 'shutdown'));
  }

  public function is_enabled() {
    return $this->isEnabled;
  } 

  public function statement_store($statements) {
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