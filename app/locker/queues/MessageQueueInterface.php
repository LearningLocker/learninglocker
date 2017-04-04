<?php namespace app\locker\queues;

interface MessageQueueInterface {
  public function publishStatements($statements);
  public function shutdown();
}