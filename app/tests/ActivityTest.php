<?php

class ActivityTest extends TestCase {

  /**
   * Test Activity
   */
  public function testActivityCRUD() {
    $activity = new Activity;
    $activity->_id = \app\locker\helpers\Helpers::getRandomValue();
    $activity->definition = array(
      'type' => \app\locker\helpers\Helpers::getRandomValue(),
      'name' => array(
        'en-US' => \app\locker\helpers\Helpers::getRandomValue()
      ),
      'description' => array(
        'en-US' => \app\locker\helpers\Helpers::getRandomValue()
      )
    );
    $result = $activity->save();
    $this->assertTrue($result);

    // Load activity from db
    $aid = $activity->_id;
    $db_activity = Activity::find($aid);
    $this->assertEquals($db_activity->_id, $activity->_id);

    // Delete activity
    $db_activity->delete();
    $this->assertEquals(Activity::find($aid), NULL);
  }
}

