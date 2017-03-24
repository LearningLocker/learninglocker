<?php namespace Tests\listeners;

use \Tests\StatementsTestCase as StatementsTestCase;

class MessageQueueTest extends StatementsTestCase {
  use \Tests\Routes\RouteTestTrait;

  public function setup() {
    \app\locker\listeners\MessageQueueHandler::testDummy(true);
    parent::setUp();
  }

  public function testQueuingSingle() {
    $isEnabled = \app\locker\listeners\MessageQueueHandler::enabled();
    $this->assertEquals($isEnabled, true);

    $params = ['CONTENT_TYPE' => 'application/json'];
    $server = array_merge($this->getServer($this->ll_client), []);
    $statement = $this->generateStatement([]);
    $content = json_encode($statement);
    $response = $this->request('POST', '/data/xAPI/statements', $params, $server, $content);

    $published = \app\locker\queues\DummyMessageQueue::$statements;
    $this->assertEquals(count($published), 1);

    $models = json_decode($published[0]);

    $this->assertEquals(isset($models[0]->id), true);
    $this->assertEquals(isset($models[0]->lrs_id), true);
    $this->assertEquals(isset($models[0]->client_id), true);
    $this->assertEquals(isset($models[0]->statement), true);

    // Default config filters these
    $this->assertEquals(isset($models[0]->timestamp), false);
    $this->assertEquals(isset($models[0]->active), false);
    $this->assertEquals(isset($models[0]->voided), false);

    $this->assertEquals($models[0]->statement->actor->mbox, $statement['actor']['mbox']);
    $this->assertEquals($models[0]->statement->actor->objectType, $statement['actor']['objectType']);
    $this->assertEquals($models[0]->statement->verb->id, $statement['verb']['id']);
    $this->assertEquals($models[0]->statement->object->id, $statement['object']['id']);
    $this->assertEquals($models[0]->statement->object->objectType, $statement['object']['objectType']);
    $this->assertEquals($models[0]->statement->object->objectType, $statement['object']['objectType']);
    $this->assertEquals($models[0]->statement->timestamp, $statement['timestamp']);
    $this->assertEquals($models[0]->statement->version, $statement['version']);

  }

  public function testQueuingMulti() {
    $isEnabled = \app\locker\listeners\MessageQueueHandler::enabled();
    $this->assertEquals($isEnabled, true);

    $params = ['CONTENT_TYPE' => 'application/json'];
    $server = array_merge($this->getServer($this->ll_client), []);

    $statements = [];
    $statements[] = $this->generateStatement(['id' => $this->getUUID()]);
    $statements[] = $this->generateStatement(['id' => $this->getUUID()]);
    $statements[] = $this->generateStatement(['id' => $this->getUUID()]);

    $content = json_encode($statements);
    $response = $this->request('POST', '/data/xAPI/statements', $params, $server, $content);

    $published = \app\locker\queues\DummyMessageQueue::$statements;
    $this->assertEquals(count($published), 2);
    $models = json_decode($published[1]);

    $this->assertEquals(count($models), 3);

    for ($i = 0; $i < count($models); $i++) {
      $this->assertEquals(isset($models[$i]->id), true);
      $this->assertEquals(isset($models[$i]->lrs_id), true);
      $this->assertEquals(isset($models[$i]->client_id), true);
      $this->assertEquals(isset($models[$i]->statement), true);

      // Default config filters these
      $this->assertEquals(isset($models[$i]->timestamp), false);
      $this->assertEquals(isset($models[$i]->active), false);
      $this->assertEquals(isset($models[$i]->voided), false);

      $this->assertEquals($models[$i]->statement->actor->mbox, $statements[$i]['actor']['mbox']);
      $this->assertEquals($models[$i]->statement->actor->objectType, $statements[$i]['actor']['objectType']);
      $this->assertEquals($models[$i]->statement->verb->id, $statements[$i]['verb']['id']);
      $this->assertEquals($models[$i]->statement->object->id, $statements[$i]['object']['id']);
      $this->assertEquals($models[$i]->statement->object->objectType, $statements[$i]['object']['objectType']);
      $this->assertEquals($models[$i]->statement->object->objectType, $statements[$i]['object']['objectType']);
      $this->assertEquals($models[$i]->statement->timestamp, $statements[$i]['timestamp']);
      $this->assertEquals($models[$i]->statement->version, $statements[$i]['version']);
    }
  }

  public function tearDown() {
    parent::tearDown();
    \app\locker\listeners\MessageQueueHandler::testDummy(false);
  }

  private function getUUID() {
    $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
      mt_rand(0, 0xffff), mt_rand(0, 0xffff),
      mt_rand(0, 0xffff),
      mt_rand(0, 0x0fff) | 0x4000,
      mt_rand(0, 0x3fff) | 0x8000,
      mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );

    return $uuid;
  }
}
