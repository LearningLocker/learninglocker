<?php namespace app\locker\queues;

use app\locker\queues\MessageQueueInterface;

class DummyMessageQueue implements MessageQueueInterface {
  public static $statements = array();

  public function __construct() {}

  public function publish_statements($statements) {
    array_push(self::$statements, $statements);
    return true;
  }

  public function shutdown() {
    return true;
  }
};

