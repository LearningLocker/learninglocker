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

  public function saveActivity( $activity_id, $activity_def ){

    $exists = \DB::table('activities')->find( $activity_id );

    //if the object activity exists, return details on record.
    if( $exists ){
      return $exists['definition'];
    }else{
      //save it
      \DB::table('activities')->insert(
        array('_id'        => $activity_id, 
              'definition' => $activity_def)
      );
      return $activity_def;
    }

  }

  public function getActivity( $activity_id ){
    return  \DB::table('activities')->where('_id', $activity_id)->first();
  }

}