<?php namespace Tests\listeners;

use \Tests\StatementsTestCase as StatementsTestCase;

class MessageQueueTest extends StatementsTestCase {
  use \Tests\Routes\RouteTestTrait;

  public function setup() {
    \app\locker\listeners\MessageQueueHandler::testDummy(true);
    parent::setUp();
  }

  public function testQueuing() {
    $isEnabled = \app\locker\listeners\MessageQueueHandler::enabled();
    $this->assertEquals($isEnabled, true);

    $params = ['CONTENT_TYPE' => 'application/json'];
    $server = array_merge($this->getServer($this->ll_client), []);
    $statement = $this->generateStatement([]);
    $content = json_encode($statement);
    $response = $this->request('POST', '/data/xAPI/statements', $params, $server, $content);

    $published = \app\locker\queues\DummyMessageQueue::$statements;
    $this->assertEquals(count($published), 1);
    $this->assertEquals(count($published[0]), 1);
    
    $this->assertEquals($published[0][0]->id, $statement['id']);
    $this->assertEquals($published[0][0]->actor->mbox, $statement['actor']['mbox']);
    $this->assertEquals($published[0][0]->actor->objectType, $statement['actor']['objectType']);
    $this->assertEquals($published[0][0]->verb->id, $statement['verb']['id']);
    $this->assertEquals($published[0][0]->object->id, $statement['object']['id']);
    $this->assertEquals($published[0][0]->object->objectType, $statement['object']['objectType']);
    $this->assertEquals($published[0][0]->object->objectType, $statement['object']['objectType']);
    $this->assertEquals($published[0][0]->timestamp, $statement['timestamp']);
    $this->assertEquals($published[0][0]->version, $statement['version']);
  }

  public function tearDown() {
    parent::tearDown();
    \app\locker\listeners\MessageQueueHandler::testDummy(false);
  }
}
