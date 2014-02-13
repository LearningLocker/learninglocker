<?php namespace Locker\Repository\Activity;

interface ActivityRepository {

  public function saveActivity( $activity_id, $activity_def );

  public function getActivity( $activity_id );

}