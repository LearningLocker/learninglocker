<?php namespace app\locker\queues;

use app\locker\queues\RabbitMQ;
use app\locker\queues\DummyMessageQueue;

class MessageQueueFactory {
  public static function getMessageQueueInstance($type) {
    if ($type == 'rabbitmq') {
      return new RabbitMQ();
    } else if ($type == 'dummy') {
      return new DummyMessageQueue();
    }

    throw new Exception('Invalid Message Queue type: ' . $type);
  }  
}