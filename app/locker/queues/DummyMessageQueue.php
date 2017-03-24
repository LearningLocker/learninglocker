<?php namespace app\locker\queues;

use app\locker\queues\MessageQueueInterface;

class DummyMessageQueue implements MessageQueueInterface {
  public static $statements = array();

  public function __construct() {}

  public function publishStatements($statements) {
    array_push(self::$statements, json_encode($statements));
    return true;
  }

  public function shutdown() {
    return true;
  }
};

