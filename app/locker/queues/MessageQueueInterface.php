<?php namespace app\locker\queues;

interface MessageQueueInterface {
  public function publish_statements($statements);
  public function shutdown();
}