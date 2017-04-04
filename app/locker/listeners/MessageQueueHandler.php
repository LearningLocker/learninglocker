<?php namespace app\locker\listeners;

use \Config as Config;
use app\locker\queues\MessageQueueInterface;
use app\locker\queues\MessageQueueFactory;
use \Locker\Helpers\Exceptions as Exceptions;

class MessageQueueHandler {
  protected $queue;
  protected $messageIncludes;
  protected $messageExcludes;
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
    $this->setIncludes(Config::get('messagequeue.message_includes', false));
    $this->setExcludes(Config::get('messagequeue.message_excludes', false));

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

  public function setIncludes($includes) {
    $this->messageIncludes = $this->filtersToTree($includes);
  }

  public function setExcludes($excludes) {
    $this->messageExcludes = $this->filtersToTree($excludes);
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
    // Needed to handle the odd structure we get back from MongoDB
    $message = [
      'id' => $model['_id']->{'$id'},
      'lrs_id' => $model['lrs_id']->{'$id'},
      'client_id' => $model['client_id'],
      'statement' => $model['statement'],
      'active' => $model['active'],
      'voided' => $model['voided'],
      'timestamp' => $model['timestamp']->sec,
      'stored' => $model['stored']->sec
    ];

    $message = $this->filterMessage($message, $this->messageIncludes, 1);
    $message = $this->filterMessage($message, $this->messageExcludes, -1);

    return $message;
  }

  private function filterMessage($message, $filters, $action) {
    if ($filters === false) {
      return $message;
    }

    if ($action === 1) {
      $result = []; // include start with empty result
    } else {
      $result = $message; // exclude starts with everything
    }

    // Iterate filters and add/remove item
    foreach ($filters as $key => $value) {
      // Filter leaf node (add all)
      if (count($filters[$key]) === 0) {
        if ($action === 1 && isset($message[$key])) {
          $result[$key] = $message[$key];
        } else {
          unset($result[$key]);
        }
      } else { // Non-leaf node, go deeper
        $result[$key] = $this->filterMessage($message[$key], $filters[$key], $action);
      }
    }

    return $result;
  }

  private function filtersToTree($filters) {
    // Must be array or false
    if (is_bool($filters)) {
      if ($filters) {
        throw new Exceptions\Exception('Message queue include_keys option must be array or false');
      }

      return false;
    }

    // Iterate over filter items and expand in to a tree
    $tree = [];
    for($i = 0; $i < count($filters); $i++) {
      $path = &$tree;
      $parts = explode('.', $filters[$i]);
      for ($j = 0; $j < count($parts); $j++) {
        if (!isset($path[$parts[$j]])) {
          $path[$parts[$j]] = [];
        }

        $path = &$path[$parts[$j]];
      }
    }

    return $tree;
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