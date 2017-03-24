<?php namespace app\locker\listeners;

use \Config as Config;
use app\locker\queues\MessageQueueInterface;
use app\locker\queues\MessageQueueFactory;
use \Locker\Helpers\Exceptions as Exceptions;

class MessageQueueHandler {
  protected $queue;
  protected $modelKeys;
  protected static $testDummy = false; // Used by tests

  public function __construct() {  
    // If not enabled, we have nothing more to do
    if ($this::enabled() != true) {
      return;
    }  

    $type = self::getType();
    $queue = MessageQueueFactory::getMessageQueueInstance($type);
    $this->setMessageQueue($queue);

    // Setup filters that determine message content
    $this->modelKeys = array_flip(Config::get('messagequeue.model_keys', []));
    if (!is_array($this->modelKeys)) {
      throw new Exceptions\Exception('Option messagequeue.model_keys must be an array');
    }

    // If we setup a connection, make sure to close it during shutdown
    register_shutdown_function(array($this, 'shutdown'));
  }

  public function setMessageQueue($queue) {
    if (!($queue instanceof MessageQueueInterface)) {
      throw new Exceptions\Exception('Message queue does not conform to MessageQueueInterface');
      return;
    }

    $this->queue = $queue;
  }

  public function statementInserted($models) {
    $message = $this->constructStatementsMessage($models);
    $this->queue->publishStatements($message);
  }

  public function constructStatementsMessage($models) {
    // Determin if associative array or not
    $keys = array_keys($models);
    if (array_keys($keys) !== $keys) {
      $models = [$models];
    }

    return array_map([$this, 'mapStatementModel'], $models);
  }
  
  public function mapStatementModel($model) {
    $result = [
      'id' => $model['_id']->{'$id'},
      'lrs_id' => $model['lrs_id']->{'$id'},
      'client_id' => $model['client_id'],
      'statement' => $model['statement'],
      'active' => $model['active'],
      'voided' => $model['voided'],
      'timestamp' => $model['timestamp']->sec,
      'stored' => $model['stored']->sec
    ];

    return array_intersect_key($result, $this->modelKeys);
  }

  public function shutdown() {
    $this->queue->shutdown();
  }

  public static function getType() {
    if (self::$testDummy) {
      return 'dummy';
    }

    return Config::get('messagequeue.type');
  }

  public static function enabled() {
    if (self::$testDummy) {
      return true;
    }

    return Config::get('messagequeue.enabled');
  } 

  public static function testDummy($state) {
    self::$testDummy = $state;
  }
}