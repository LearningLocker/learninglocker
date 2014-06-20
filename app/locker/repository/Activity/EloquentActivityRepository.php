<?php namespace Locker\Repository\Activity;

use Activity;

class EloquentActivityRepository implements ActivityRepository {

  /**
  * Activity
  */
  protected $activity;

  /**
   * Construct
   *
   * @param Activity $activity
   */
  public function __construct( Activity $activity ){

    $this->activity = $activity;

  }

  /**
   * This is a temp solution, we need something better depending
   * on authority to update activity stored.
   *
   **/
  public function saveActivity( $activity_id, $activity_def ){

    $exists = \Activity::find( $activity_id );

    //if the object activity exists, remove and update with recent
    if( $exists ){
      \Activity::where('_id', $activity_id)->delete(); 
    }

    //save record
    \Activity::insert(
      array('_id'        => $activity_id, 
            'definition' => $activity_def)
    );

  }

  public function getActivity( $activity_id ){
    return  \Activity::where('_id', $activity_id)->first();
  }

}