<?php

class ActivityTest extends TestCase {

  /**
   * Test Activity
   */
  public function testActivityCRUD() {
    $activity = new Activity;
    $activity->_id = \Locker\Helpers\Helpers::getRandomValue();
    $activity->definition = array(
      'type' => \Locker\Helpers\Helpers::getRandomValue(),
      'name' => array(
        'en-US' => \Locker\Helpers\Helpers::getRandomValue()
      ),
      'description' => array(
        'en-US' => \Locker\Helpers\Helpers::getRandomValue()
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

