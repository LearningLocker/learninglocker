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
    $statement = $this->generateStatement(['id' => $this->getUUID()]);
    $content = json_encode([$statement]);
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

    $this->assertEquals($models[0]->statement->id, $statement['id']);

    $this->assertEquals(isset($models[0]->statement->actor->mbox), false);
    $this->assertEquals(isset($models[0]->statement->actor->objectType), false);
    $this->assertEquals(isset($models[0]->statement->verb->id), false);
    $this->assertEquals(isset($models[0]->statement->object->id), false);
    $this->assertEquals(isset($models[0]->statement->object->objectType), false);
    $this->assertEquals(isset($models[0]->statement->object->objectType), false);
    $this->assertEquals(isset($models[0]->statement->timestamp), false);
    $this->assertEquals(isset($models[0]->statement->version), false);
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

      $this->assertEquals($models[$i]->statement->id, $statements[$i]['id']);

      $this->assertEquals(isset($models[$i]->statement->actor->mbox), false);
      $this->assertEquals(isset($models[$i]->statement->actor->objectType), false);
      $this->assertEquals(isset($models[$i]->statement->verb->id), false);
      $this->assertEquals(isset($models[$i]->statement->object->id), false);
      $this->assertEquals(isset($models[$i]->statement->object->objectType), false);
      $this->assertEquals(isset($models[$i]->statement->object->objectType), false);
      $this->assertEquals(isset($models[$i]->statement->timestamp), false);
      $this->assertEquals(isset($models[$i]->statement->version), false);
    }
  }

  public function testNestedSetIncludes() {
    $isEnabled = \app\locker\listeners\MessageQueueHandler::enabled();
    $this->assertEquals($isEnabled, true);

    $mqHandler = $this->app->make('MessageQueueHandler');
    $mqHandler->setIncludes(['id', 'lrs_id', 'client_id', 'statement.actor.mbox']);

    $params = ['CONTENT_TYPE' => 'application/json'];
    $server = array_merge($this->getServer($this->ll_client), []);
    $statement = $this->generateStatement(['id' => $this->getUUID()]);
    $content = json_encode([$statement]);
    $response = $this->request('POST', '/data/xAPI/statements', $params, $server, $content);

    $published = \app\locker\queues\DummyMessageQueue::$statements;
    $this->assertEquals(count($published), 3);

    $models = json_decode($published[2]);

    $this->assertEquals(isset($models[0]->id), true);
    $this->assertEquals(isset($models[0]->lrs_id), true);
    $this->assertEquals(isset($models[0]->client_id), true);
    $this->assertEquals(isset($models[0]->statement), true);
    $this->assertEquals(isset($models[0]->stored), false);

    // Default config filters these
    $this->assertEquals(isset($models[0]->timestamp), false);
    $this->assertEquals(isset($models[0]->active), false);
    $this->assertEquals(isset($models[0]->voided), false);

    $this->assertEquals($models[0]->statement->actor->mbox, $statement['actor']['mbox']);

    $this->assertEquals(isset($models[0]->statement->actor->mbox), true);
    $this->assertEquals(isset($models[0]->statement->actor->objectType), false);
    $this->assertEquals(isset($models[0]->statement->verb->id), false);
    $this->assertEquals(isset($models[0]->statement->object->id), false);
    $this->assertEquals(isset($models[0]->statement->object->objectType), false);
    $this->assertEquals(isset($models[0]->statement->object->objectType), false);
    $this->assertEquals(isset($models[0]->statement->timestamp), false);
    $this->assertEquals(isset($models[0]->statement->version), false);
  }

  public function testNestedSetExcludes() {
    $isEnabled = \app\locker\listeners\MessageQueueHandler::enabled();
    $this->assertEquals($isEnabled, true);

    $mqHandler = $this->app->make('MessageQueueHandler');
    $mqHandler->setIncludes(['id', 'lrs_id', 'client_id', 'statement', 'stored']);
    $mqHandler->setExcludes(['statement.actor.mbox']);

    $params = ['CONTENT_TYPE' => 'application/json'];
    $server = array_merge($this->getServer($this->ll_client), []);
    $statement = $this->generateStatement(['id' => $this->getUUID()]);
    $content = json_encode([$statement]);
    $response = $this->request('POST', '/data/xAPI/statements', $params, $server, $content);

    $published = \app\locker\queues\DummyMessageQueue::$statements;
    $this->assertEquals(count($published), 4);

    $models = json_decode($published[3]);

    $this->assertEquals(isset($models[0]->id), true);
    $this->assertEquals(isset($models[0]->lrs_id), true);
    $this->assertEquals(isset($models[0]->client_id), true);
    $this->assertEquals(isset($models[0]->statement), true);
    $this->assertEquals(isset($models[0]->stored), true);

    // Default config filters these
    $this->assertEquals(isset($models[0]->timestamp), false);
    $this->assertEquals(isset($models[0]->active), false);
    $this->assertEquals(isset($models[0]->voided), false);

    $this->assertEquals($models[0]->statement->id, $statement['id']);

    $this->assertEquals(isset($models[0]->statement->actor->mbox), false);
    $this->assertEquals(isset($models[0]->statement->actor->objectType), true);
    $this->assertEquals(isset($models[0]->statement->verb->id), true);
    $this->assertEquals(isset($models[0]->statement->object->id), true);
    $this->assertEquals(isset($models[0]->statement->object->objectType), true);
    $this->assertEquals(isset($models[0]->statement->object->objectType), true);
    $this->assertEquals(isset($models[0]->statement->timestamp), true);
    $this->assertEquals(isset($models[0]->statement->version), true);
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
