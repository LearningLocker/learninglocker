<?php namespace app\locker\queues;

use \Config as Config;
use PhpAmqpLib\Connection\AMQPSSLConnection;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class RabbitMQ implements MessageQueueInterface {
  protected $connection = false;
  protected $exchange;
  protected $statement_topic;

  public function __construct() {
    $options = Config::get('messagequeue.rabbitmq');
    $this->exchange = $options['exchange'];
    $this->statement_topic = $options['statement_topic'];

    $sslEnabled = Config::get('rabbitmq.ssl_enabled');
    if ($sslEnabled) {
      $sslOptions = Config::get('rabbitmq.ssl');
      $this->connection = new AMQPSSLConnection($options['host'], $options['port'],
        $options['username'], $options['password'], $options['vhost'], $sslOptions);
    } else {
      $this->connection = new AMQPStreamConnection($options['host'], $options['port'],
        $options['username'], $options['password'], $options['vhost']);
    }
  }

  public function publishStatements($statements) {
    if ($this->connection == false) {
       return false;
    }

    // Publish to topic exchange
    $data = json_encode($statements);
    $msg = new AMQPMessage($data, ['content_type'=>'application/json']);
    $channel = $this->connection->channel();
    $channel->basic_publish($msg, $this->exchange,  $this->statement_topic);
    $channel->close();

    return true;
  }

  public function shutdown() {
    if ($this->connection) {
      // Close the connection on shutdown
      $this->connection->close();
    }

    return true;
  }
}