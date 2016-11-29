<?php namespace app\locker\listeners;

use \Config as Config;
use app\locker\queues\MessageQueueInterface;
use app\locker\queues\MessageQueueFactory;
use \Locker\Helpers\Exceptions as Exceptions;

class MessageQueueHandler {
  protected $queue;
  protected static $testDummy = false; // Used by tests

  public function __construct() {  
    // If not enabled, we have nothing more to do
    if ($this::enabled() != true) {
      return;
    }  

    $type = self::getType();
    $queue = MessageQueueFactory::getMessageQueueInstance($type);
    $this->setMessageQueue($queue);

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

  public function statementStore($statements) {
    $this->queue->publishStatements($statements);
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
    return self::getType() != 'none';
  } 

  public static function testDummy($state) {
    self::$testDummy = $state;
  }
}